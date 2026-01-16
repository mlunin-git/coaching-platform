"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import {
  getGroupParticipants,
  getGroupIdeas,
  getGroupEvents,
  getGroupByToken,
} from "@/lib/planning";
import { ParticipantDropdown } from "@/components/planning/ParticipantDropdown";
import { QuickStats } from "@/components/planning/QuickStats";
import { IdeasList } from "@/components/planning/IdeasList";
import { EventsList } from "@/components/planning/EventsList";
import { EventForm } from "@/components/planning/EventForm";
import { Analytics } from "@/components/planning/Analytics";

interface Participant {
  id: string;
  name: string;
  color: string | null;
}

interface Idea {
  id: string;
  title: string;
  description?: string;
  location?: string;
  group_id: string;
  participant_id: string;
  promoted_to_event_id?: string;
  created_at: string;
  updated_at: string;
  participant?: { name: string; color?: string };
  promoted_event?: { id: string; title: string };
  vote_count: number;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  city?: string;
  country?: string;
  is_archived: boolean;
  group_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator?: { name: string; color?: string };
  planning_event_participants?: Array<{ id: string }>;
  attendee_count?: number;
}

type TabType = "ideas" | "events" | "archive";

export default function GroupPage() {
  const { t } = useLanguage();
  const params = useParams();
  const groupId = params.groupId as string;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("ideas");
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [actualGroupId, setActualGroupId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [attendingEventIds, setAttendingEventIds] = useState<Set<string>>(new Set());

  // Load saved participant selection
  useEffect(() => {
    const saved = sessionStorage.getItem(`planning_participant_${groupId}`);
    if (saved) {
      setSelectedParticipantId(saved);
    }
  }, [groupId]);

  const [error, setError] = useState<string | null>(null);

  // Fetch group data
  useEffect(() => {
    const fetchData = async () => {
      let isMounted = true;

      if (!isMounted) setLoading(true);

      try {
        // Get group info by token
        const group = await getGroupByToken(groupId);
        if (!group) {
          if (isMounted) {
            setError("Planning group not found");
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setGroupName(group.name);
          setActualGroupId(group.id);
        }

        // Get participants using actual group ID
        const participantsData = await getGroupParticipants(group.id);
        if (isMounted) {
          setParticipants(participantsData);
        }

        // Get ideas and events using actual group ID
        const ideasData = await getGroupIdeas(group.id);
        const eventsData = await getGroupEvents(group.id);

        if (isMounted) {
          setIdeas(ideasData);
          setEvents(eventsData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load planning group";
          setError(errorMessage);
          console.error("Error fetching planning group:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      return () => {
        isMounted = false;
      };
    };

    const cleanup = fetchData();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [groupId]);

  const handleParticipantSelect = (participantId: string) => {
    setSelectedParticipantId(participantId);
    sessionStorage.setItem(`planning_participant_${groupId}`, participantId);
  };

  const handleDataRefresh = async () => {
    if (!actualGroupId) return;
    const ideasData = await getGroupIdeas(actualGroupId);
    const eventsData = await getGroupEvents(actualGroupId);
    setIdeas(ideasData);
    setEvents(eventsData);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleArchiveEvent = async (eventId: string) => {
    const supabase = getSupabaseClient();
    try {
      await supabase
        .from("planning_events")
        .update({ is_archived: true })
        .eq("id", eventId);
      handleDataRefresh();
    } catch (err) {
      console.error("Error archiving event:", err);
    }
  };

  const handleUnarchiveEvent = async (eventId: string) => {
    const supabase = getSupabaseClient();
    try {
      await supabase
        .from("planning_events")
        .update({ is_archived: false })
        .eq("id", eventId);
      handleDataRefresh();
    } catch (err) {
      console.error("Error unarchiving event:", err);
    }
  };

  const handleMarkAttending = async (eventId: string) => {
    if (!selectedParticipantId) return;

    const supabase = getSupabaseClient();
    const isAttending = attendingEventIds.has(eventId);

    try {
      if (isAttending) {
        // Remove attendance
        await supabase
          .from("planning_event_participants")
          .delete()
          .eq("event_id", eventId)
          .eq("participant_id", selectedParticipantId);

        setAttendingEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      } else {
        // Add attendance
        await supabase.from("planning_event_participants").insert({
          event_id: eventId,
          participant_id: selectedParticipantId,
        });

        setAttendingEventIds((prev) => new Set([...prev, eventId]));
      }
      handleDataRefresh();
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };

  const handleDemoteEvent = async (eventId: string) => {
    if (!confirm("Convert this event back to an idea? This will move it to the ideas list.")) {
      return;
    }

    if (!actualGroupId) return;

    const supabase = getSupabaseClient();
    try {
      const eventToConvert = events.find((e) => e.id === eventId);
      if (!eventToConvert) return;

      // Create idea from event
      const { data: newIdea, error: ideaError } = await supabase
        .from("planning_ideas")
        .insert({
          group_id: actualGroupId,
          participant_id: eventToConvert.created_by || selectedParticipantId,
          title: eventToConvert.title,
          description: eventToConvert.description || undefined,
          location: eventToConvert.location || undefined,
        } as any)
        .select()
        .single();

      if (ideaError || !newIdea) {
        console.error("Error creating idea:", ideaError);
        return;
      }

      // Delete event
      await supabase.from("planning_events").delete().eq("id", eventId);

      handleDataRefresh();
    } catch (err) {
      console.error("Error demoting event:", err);
      alert("Error converting event back to idea");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
      <main className="container mx-auto px-4 pb-8 max-w-7xl">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side (2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header with Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {t("planning.title")}
                </h1>
                <QuickStats
                  eventsCount={events.filter((e) => !e.is_archived).length}
                  ideasCount={ideas.filter((idea) => !idea.promoted_to_event_id).length}
                  participantsCount={participants.length}
                />
              </div>

              {/* Ideas and Events Tabs */}
              <div className="bg-white rounded-xl shadow-lg">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("ideas")}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === "ideas"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    💡 {t("planning.participant.ideas")}
                  </button>
                  <button
                    onClick={() => setActiveTab("events")}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === "events"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    📅 {t("planning.participant.events")}
                  </button>
                  <button
                    onClick={() => setActiveTab("archive")}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === "archive"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    📦 {t("planning.participant.archive")}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {!selectedParticipantId ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {t("planning.ideas.selectNameToParticipate")}
                      </p>
                    </div>
                  ) : (
                    <>
                      {activeTab === "ideas" && actualGroupId && (
                        <SectionErrorBoundary section="ideas list">
                          <IdeasList
                            ideas={ideas}
                            groupId={actualGroupId}
                            selectedParticipantId={selectedParticipantId}
                            onDataRefresh={handleDataRefresh}
                          />
                        </SectionErrorBoundary>
                      )}
                      {activeTab === "events" && (
                        <SectionErrorBoundary section="events list">
                          <EventsList
                            events={events.filter((e) => !e.is_archived)}
                            selectedParticipantId={selectedParticipantId}
                            onEdit={handleEditEvent}
                            onArchive={handleArchiveEvent}
                            onUnarchive={handleUnarchiveEvent}
                            onMarkAttending={handleMarkAttending}
                            onDemote={handleDemoteEvent}
                            attendingEventIds={attendingEventIds}
                          />
                        </SectionErrorBoundary>
                      )}
                      {activeTab === "archive" && (
                        <SectionErrorBoundary section="archive list">
                          <EventsList
                            events={events.filter((e) => e.is_archived)}
                            selectedParticipantId={selectedParticipantId}
                            onEdit={handleEditEvent}
                            onArchive={handleArchiveEvent}
                            onUnarchive={handleUnarchiveEvent}
                            onMarkAttending={handleMarkAttending}
                            onDemote={handleDemoteEvent}
                            attendingEventIds={attendingEventIds}
                          />
                        </SectionErrorBoundary>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Right Side (1 column) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Participant Selector */}
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {t("planning.participant.selectName")}
                </h3>
                <ParticipantDropdown
                  participants={participants}
                  selected={selectedParticipantId}
                  onSelect={handleParticipantSelect}
                />
              </div>

              {/* Analytics - Events per month, Cities Map, and Top Cities */}
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-96">
                <SectionErrorBoundary section="analytics">
                  <Analytics
                    events={events}
                    ideas={ideas}
                    participants={participants}
                  />
                </SectionErrorBoundary>
              </div>
            </div>
          </div>
        )}

        {/* Event Editing Modal */}
        {showEventForm && editingEvent && selectedParticipantId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("planning.events.editEvent")}
              </h2>
              <EventForm
                groupId={actualGroupId || groupId}
                participantId={selectedParticipantId}
                initialEvent={editingEvent}
                onSuccess={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                  handleDataRefresh();
                }}
                onCancel={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
