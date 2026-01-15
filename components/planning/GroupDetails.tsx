"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import { getGroupParticipants } from "@/lib/planning";
import { ShareLink } from "./ShareLink";
import { ParticipantManager } from "./ParticipantManager";

interface PlanningGroup {
  id: string;
  name: string;
  access_token: string;
  created_at: string;
  updated_at: string;
}

interface Participant {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface GroupDetailsProps {
  group: PlanningGroup;
  onBack: () => void;
  onGroupUpdated: () => void;
}

export function GroupDetails({
  group,
  onBack,
  onGroupUpdated,
}: GroupDetailsProps) {
  const { t } = useLanguage();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      const data = await getGroupParticipants(group.id);
      setParticipants(data);
      setLoading(false);
    };

    fetchParticipants();
  }, [group.id]);

  const handleParticipantAdded = async () => {
    const data = await getGroupParticipants(group.id);
    setParticipants(data);
  };

  const handleDeleteParticipant = async (participantId: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("planning_participants")
      .delete()
      .eq("id", participantId);

    if (!error) {
      const data = await getGroupParticipants(group.id);
      setParticipants(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
      >
        ← {t("common.back")}
      </button>

      {/* Group Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h2>
        <p className="text-gray-600">
          {participants.length} {t("planning.admin.participants")}
        </p>
      </div>

      {/* Share Link */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("planning.admin.shareLink")}
        </h3>
        <ShareLink accessToken={group.access_token} />
      </div>

      {/* Participants Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("planning.admin.participants")}
        </h3>

        <ParticipantManager
          groupId={group.id}
          onParticipantAdded={handleParticipantAdded}
          onParticipantRemoved={handleParticipantRemoved}
        />

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : participants.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {t("planning.validation.noParticipants")}
          </p>
        ) : (
          <div className="mt-6 space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: participant.color }}
                />
                <span className="text-gray-900 font-medium flex-1">
                  {participant.name}
                </span>
                <button
                  onClick={() => handleDeleteParticipant(participant.id)}
                  className="text-red-600 hover:text-red-700 font-bold text-sm"
                >
                  {t("common.delete")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
