"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import { useState } from "react";
import { EventForm } from "./EventForm";

interface PromoteIdeaModalProps {
  ideaId: string;
  ideaTitle: string;
  ideaDescription?: string;
  ideaLocation?: string;
  groupId: string;
  participantId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function PromoteIdeaModal({
  ideaId,
  ideaTitle,
  ideaDescription,
  ideaLocation,
  groupId,
  participantId,
  onSuccess,
  onClose,
}: PromoteIdeaModalProps) {
  const { t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [eventIdToLink, setEventIdToLink] = useState<string | null>(null);

  // This will be called after EventForm successfully creates an event
  const linkIdeaToEvent = async (eventId: string) => {
    setIsCreating(true);
    try {
      const supabase = getSupabaseClient();

      // Link idea to the newly created event
      const { error: linkError } = await supabase
        .from("planning_ideas")
        .update({ promoted_to_event_id: eventId })
        .eq("id", ideaId);

      if (linkError) {
        setError(linkError.message || t("planning.error.unknown"));
        setIsCreating(false);
        return;
      }

      setIsCreating(false);
      onSuccess();
    } catch (err) {
      setError(t("planning.error.unknown"));
      setIsCreating(false);
    }
  };

  const handleEventFormSuccess = async () => {
    // Fetch the most recently created event for this group
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("planning_events")
        .select("id")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        setError("Error linking idea to event");
        return;
      }

      await linkIdeaToEvent(data.id);
    } catch (err) {
      setError(t("planning.error.unknown"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("planning.ideas.promoteToEvent")}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Creating event from idea: <span className="font-semibold">{ideaTitle}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <EventForm
          groupId={groupId}
          participantId={participantId}
          ideaData={{
            title: ideaTitle,
            description: ideaDescription,
            location: ideaLocation,
          }}
          onSuccess={handleEventFormSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
