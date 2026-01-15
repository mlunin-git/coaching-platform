"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import {
  getGroupParticipants,
  getGroupIdeas,
  getGroupEvents,
  getGroupByToken,
} from "@/lib/planning";
import { AppsHeader } from "@/components/apps/AppsHeader";
import { ParticipantSelector } from "@/components/planning/ParticipantSelector";
import { IdeasList } from "@/components/planning/IdeasList";
import { EventsList } from "@/components/planning/EventsList";

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
  location: string;
  city: string;
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

  // Load saved participant selection
  useEffect(() => {
    const saved = localStorage.getItem(`planning_participant_${groupId}`);
    if (saved) {
      setSelectedParticipantId(saved);
    }
  }, [groupId]);

  // Fetch group data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Get group info
        const group = await getGroupByToken(groupId);
        if (group) {
          setGroupName(group.name);
        }

        // Get participants
        const participantsData = await getGroupParticipants(groupId);
        setParticipants(participantsData);

        // Get ideas and events
        const ideasData = await getGroupIdeas(groupId);
        const eventsData = await getGroupEvents(groupId);

        setIdeas(ideasData as unknown as Idea[]);
        setEvents(eventsData as unknown as Event[]);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, [groupId]);

  const handleParticipantSelect = (participantId: string) => {
    setSelectedParticipantId(participantId);
    localStorage.setItem(`planning_participant_${groupId}`, participantId);
  };

  const handleDataRefresh = async () => {
    const ideasData = await getGroupIdeas(groupId);
    const eventsData = await getGroupEvents(groupId);
    setIdeas(ideasData as unknown as Idea[]);
    setEvents(eventsData as unknown as Event[]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AppsHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {groupName}
              </h1>
              <p className="text-gray-600">{participants.length} participants</p>
            </div>

            {/* Participant Selector */}
            <ParticipantSelector
              participants={participants}
              selected={selectedParticipantId}
              onSelect={handleParticipantSelect}
              groupId={groupId}
            />

            {/* Tabs */}
            {selectedParticipantId && (
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
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "ideas" ? (
                    <IdeasList
                      ideas={ideas}
                      groupId={groupId}
                      selectedParticipantId={selectedParticipantId}
                      onDataRefresh={handleDataRefresh}
                    />
                  ) : (
                    <EventsList events={events} />
                  )}
                </div>
              </div>
            )}

            {/* Call to action if no participant selected */}
            {!selectedParticipantId && (
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-lg">
                <p className="text-indigo-900">
                  {t("planning.participant.selectName")}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
