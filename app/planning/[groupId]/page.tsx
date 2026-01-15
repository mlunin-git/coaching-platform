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
import { Analytics } from "@/components/planning/Analytics";

interface Participant {
  id: string;
  name: string;
  color: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  location: string;
  participant: { name: string; color: string };
  vote_count: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  city: string;
  country: string;
  is_archived: boolean;
  creator: { name: string; color: string };
}

type TabType = "ideas" | "events";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
      <main className="container mx-auto px-4 pb-8 max-w-7xl">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - Left Side (3 columns) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Header with Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {t("planning.title")}
                </h1>
                <QuickStats
                  eventsCount={events.length}
                  ideasCount={ideas.length}
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
                    📅 {t("planning.participant.scheduledEvents")}
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
                          <EventsList events={events} />
                        </SectionErrorBoundary>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Analytics - Events per month and Cities Map */}
              <SectionErrorBoundary section="analytics">
                <Analytics
                  events={events}
                  ideas={ideas}
                  participants={participants}
                />
              </SectionErrorBoundary>
            </div>

            {/* Sidebar - Right Side (1 column) */}
            <div className="lg:col-span-1">
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
