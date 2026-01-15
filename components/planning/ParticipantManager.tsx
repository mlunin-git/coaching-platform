"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";

interface ParticipantManagerProps {
  groupId: string;
  onParticipantAdded: () => void;
  onParticipantRemoved: () => void;
}

const DEFAULT_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFE66D", // Yellow
  "#95E1D3", // Mint
  "#C7CEEA", // Lavender
  "#FF8B94", // Pink
  "#B4A7D6", // Purple
  "#73A580", // Green
];

export function ParticipantManager({
  groupId,
  onParticipantAdded,
  onParticipantRemoved,
}: ParticipantManagerProps) {
  const { t } = useLanguage();
  const [newParticipantName, setNewParticipantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newParticipantName.trim()) {
      setError(t("planning.validation.participantNameRequired"));
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // Get participants count to assign color
      const { data: existingParticipants, error: fetchError } = await supabase
        .from("planning_participants")
        .select("name")
        .eq("group_id", groupId);

      if (fetchError) {
        setError(t("planning.error.unknown"));
        setLoading(false);
        return;
      }

      // Check if name already exists
      if (
        existingParticipants?.some((p) => p.name === newParticipantName)
      ) {
        setError(t("planning.validation.participantExists"));
        setLoading(false);
        return;
      }

      // Add participant
      const colorIndex = (existingParticipants?.length || 0) % DEFAULT_COLORS.length;
      const { error: insertError } = await supabase
        .from("planning_participants")
        .insert({
          group_id: groupId,
          name: newParticipantName,
          color: DEFAULT_COLORS[colorIndex],
        });

      if (insertError) {
        console.error("Error inserting participant:", insertError);
        setError(insertError.message || t("planning.error.participantCreation"));
        setLoading(false);
        return;
      }

      setNewParticipantName("");
      setLoading(false);
      onParticipantAdded();
    } catch (err) {
      console.error("Error adding participant:", err);
      setError(t("planning.error.unknown"));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddParticipant} className="space-y-4 mb-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          value={newParticipantName}
          onChange={(e) => setNewParticipantName(e.target.value)}
          placeholder={t("planning.admin.addParticipant")}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50"
        >
          +
        </button>
      </div>
    </form>
  );
}
