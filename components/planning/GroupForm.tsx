"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import { generateAccessToken } from "@/lib/planning";

interface GroupFormProps {
  onSuccess: () => void;
  onCancel: () => void;
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

export function GroupForm({ onSuccess, onCancel }: GroupFormProps) {
  const { t } = useLanguage();
  const [groupName, setGroupName] = useState("");
  const [participants, setParticipants] = useState<
    { name: string; color: string }[]
  >([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addParticipant = () => {
    const trimmedName = newParticipantName.trim();

    if (!trimmedName) {
      setError(t("planning.validation.participantNameRequired"));
      return;
    }

    if (trimmedName.length > 100) {
      setError(t("planning.validation.participantNameTooLong"));
      return;
    }

    // Case-insensitive duplicate check
    if (participants.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError(t("planning.validation.participantExists"));
      return;
    }

    const colorIndex = participants.length % DEFAULT_COLORS.length;
    setParticipants([
      ...participants,
      { name: trimmedName, color: DEFAULT_COLORS[colorIndex] },
    ]);
    setNewParticipantName("");
    setError("");
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedGroupName = groupName.trim();

    if (!trimmedGroupName) {
      setError(t("planning.validation.groupNameRequired"));
      return;
    }

    if (trimmedGroupName.length > 255) {
      setError(t("planning.validation.groupNameTooLong"));
      return;
    }

    if (participants.length === 0) {
      setError(t("planning.validation.atLeastOneParticipant"));
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // Get current user
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(t("planning.error.unauthorized"));
        setLoading(false);
        return;
      }

      if (!session?.user?.id) {
        setError(t("planning.error.unauthorized"));
        setLoading(false);
        return;
      }

      // Get coach's user ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single()
        .timeout(5000);

      if (userError || !userData) {
        setError(t("planning.error.unauthorized"));
        setLoading(false);
        return;
      }

      // Generate access token
      const accessToken = generateAccessToken();

      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from("planning_groups")
        .insert({
          coach_id: userData.id,
          name: trimmedGroupName,
          access_token: accessToken,
        })
        .select()
        .single()
        .timeout(5000);

      if (groupError || !groupData) {
        console.error("Group creation error:", groupError);
        setError(t("planning.error.groupCreation"));
        setLoading(false);
        return;
      }

      // Create participants
      const participantInserts = participants.map((p) => ({
        group_id: groupData.id,
        name: p.name,
        color: p.color,
      }));

      const { error: participantError } = await supabase
        .from("planning_participants")
        .insert(participantInserts)
        .timeout(5000);

      if (participantError) {
        console.error("Participant creation error:", participantError);
        setError(t("planning.error.participantCreation"));
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess();
    } catch (err) {
      console.error("Group form error:", err);
      setError(t("planning.error.unknown"));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Group Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("planning.admin.groupName")}
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="e.g., Friends 2025-2026"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Participants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          {t("planning.admin.participants")}
        </label>

        {/* Add Participant Input */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addParticipant()}
            placeholder={t("planning.admin.addParticipant")}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={addParticipant}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            +
          </button>
        </div>

        {/* Participants List */}
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: participant.color }}
              />
              <span className="text-gray-900 font-medium flex-1">
                {participant.name}
              </span>
              <button
                type="button"
                onClick={() => removeParticipant(index)}
                className="text-red-600 hover:text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {participants.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            {t("planning.validation.noParticipants")}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50"
        >
          {loading ? t("common.creating") : t("planning.admin.createGroup")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all font-medium"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
