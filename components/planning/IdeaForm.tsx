"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";

interface IdeaFormProps {
  groupId: string;
  participantId: string | null;
  initialIdea?: {
    id: string;
    title: string;
    description?: string;
    location?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function IdeaForm({
  groupId,
  participantId,
  initialIdea,
  onSuccess,
  onCancel,
  onDelete,
}: IdeaFormProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialIdea?.title || "");
  const [description, setDescription] = useState(initialIdea?.description || "");
  const [location, setLocation] = useState(initialIdea?.location || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!initialIdea;

  const handleDelete = async () => {
    if (!confirm(t("planning.ideas.deleteIdea") + "? This cannot be undone.")) {
      return;
    }

    if (!initialIdea) return;

    setLoading(true);
    setError("");
    const supabase = getSupabaseClient();

    try {
      // Delete all votes first
      const { error: votesError } = await supabase
        .from("planning_idea_votes")
        .delete()
        .eq("idea_id", initialIdea.id);

      if (votesError && votesError.code !== "PGRST116") {
        console.error("Error deleting votes:", votesError);
      }

      // Delete the idea
      const { error: deleteError } = await supabase
        .from("planning_ideas")
        .delete()
        .eq("id", initialIdea.id);

      if (deleteError) {
        console.error("Error deleting idea:", deleteError);
        setError(`Error: ${deleteError.message}` || t("planning.error.unknown"));
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess();
    } catch (err) {
      console.error("Delete exception:", err);
      setError(err instanceof Error ? err.message : t("planning.error.unknown"));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!participantId) {
      setError(t("planning.validation.selectNameRequired") || "Please select your name");
      return;
    }

    if (!title.trim()) {
      setError(t("planning.validation.titleRequired"));
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      if (isEditing) {
        // Update existing idea
        const { error: updateError } = await supabase
          .from("planning_ideas")
          .update({
            title,
            description,
            location,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialIdea.id);

        if (updateError) {
          setError(updateError.message || t("planning.error.unknown"));
          setLoading(false);
          return;
        }
      } else {
        // Create new idea
        const { error: insertError } = await supabase
          .from("planning_ideas")
          .insert({
            group_id: groupId,
            participant_id: participantId,
            title,
            description,
            location,
          });

        if (insertError) {
          setError(insertError.message || t("planning.error.unknown"));
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      onSuccess();
    } catch (err) {
      setError(t("planning.error.unknown"));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-50 rounded-lg border border-indigo-200 p-4 space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("planning.ideas.title")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>

      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("planning.ideas.description")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
          rows={3}
        />
      </div>

      <div>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t("planning.ideas.location")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-medium text-sm disabled:opacity-50"
        >
          {loading ? t("common.creating") : isEditing ? t("common.save") : t("planning.ideas.createIdea")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 w-full sm:w-auto px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all font-medium text-sm"
        >
          {t("common.cancel")}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium text-sm disabled:opacity-50"
          >
            {t("planning.ideas.deleteIdea")}
          </button>
        )}
      </div>
    </form>
  );
}
