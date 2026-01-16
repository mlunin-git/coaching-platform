"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import { hasParticipantVoted } from "@/lib/planning";
import { IdeaCard } from "./IdeaCard";
import { IdeaForm } from "./IdeaForm";
import { PromoteIdeaModal } from "./PromoteIdeaModal";

interface Participant {
  name: string;
  color?: string;
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
  participant?: Participant;
  promoted_event?: { id: string; title: string };
  vote_count: number;
}

interface IdeasListProps {
  ideas: Idea[];
  groupId: string;
  selectedParticipantId: string | null;
  onDataRefresh: () => void;
}

export function IdeasList({
  ideas,
  groupId,
  selectedParticipantId,
  onDataRefresh,
}: IdeasListProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [promoteModalIdea, setPromoteModalIdea] = useState<Idea | null>(null);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter out promoted ideas and sort by vote count
  const activeIdeas = ideas.filter((idea) => !idea.promoted_to_event_id);
  const sortedIdeas = [...activeIdeas].sort((a, b) => b.vote_count - a.vote_count);

  const handleVote = async (ideaId: string) => {
    if (!selectedParticipantId) return;

    setLoading(true);
    setError(null);
    const supabase = getSupabaseClient();

    try {
      // Check if already voted
      const hasVoted = await hasParticipantVoted(ideaId, selectedParticipantId);

      if (hasVoted) {
        // Remove vote
        const { error: deleteError } = await supabase
          .from("planning_idea_votes")
          .delete()
          .eq("idea_id", ideaId)
          .eq("participant_id", selectedParticipantId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        setUserVotes((prev) => {
          const next = new Set(prev);
          next.delete(ideaId);
          return next;
        });
      } else {
        // Add vote
        const { error: insertError } = await supabase.from("planning_idea_votes").insert({
          idea_id: ideaId,
          participant_id: selectedParticipantId,
        });

        if (insertError) {
          throw new Error(insertError.message);
        }

        setUserVotes((prev) => new Set([...prev, ideaId]));
      }

      onDataRefresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update vote";
      setError(errorMessage);
      console.error("Error voting on idea:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create or Edit Idea Form */}
      {!showForm && !editingIdea ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-medium"
        >
          + {t("planning.ideas.createIdea")}
        </button>
      ) : showForm && !editingIdea ? (
        <IdeaForm
          groupId={groupId}
          participantId={selectedParticipantId}
          onSuccess={() => {
            setShowForm(false);
            onDataRefresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : editingIdea ? (
        <IdeaForm
          groupId={groupId}
          participantId={selectedParticipantId}
          initialIdea={editingIdea}
          onSuccess={() => {
            setEditingIdea(null);
            onDataRefresh();
          }}
          onCancel={() => setEditingIdea(null)}
        />
      ) : null}

      {/* Promote Modal */}
      {promoteModalIdea && (
        <PromoteIdeaModal
          ideaId={promoteModalIdea.id}
          ideaTitle={promoteModalIdea.title}
          ideaDescription={promoteModalIdea.description}
          ideaLocation={promoteModalIdea.location}
          groupId={groupId}
          participantId={selectedParticipantId}
          onSuccess={() => {
            setPromoteModalIdea(null);
            onDataRefresh();
          }}
          onClose={() => setPromoteModalIdea(null)}
        />
      )}

      {/* Ideas List */}
      {sortedIdeas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {t("planning.ideas.selectNameToParticipate")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedIdeas.map((idea) => {
            const isOwner = idea.participant_id === selectedParticipantId;
            const isBeingEdited = editingIdea?.id === idea.id;
            return (
              <div
                key={idea.id}
                className={`transition-all ${
                  isBeingEdited
                    ? "ring-2 ring-indigo-500 rounded-lg p-4 bg-indigo-50"
                    : editingIdea
                      ? "opacity-40 pointer-events-none"
                      : ""
                }`}
              >
                {isBeingEdited && (
                  <div className="mb-4 p-2 bg-indigo-100 rounded text-indigo-700 text-sm font-medium">
                    Editing: {idea.title}
                  </div>
                )}
                <IdeaCard
                  idea={idea}
                  isOwner={isOwner}
                  hasVoted={userVotes.has(idea.id)}
                  selectedParticipantId={selectedParticipantId}
                  onVote={() => handleVote(idea.id)}
                  onPromote={isOwner && !editingIdea ? () => setPromoteModalIdea(idea) : undefined}
                  onEdit={isOwner && !editingIdea ? () => setEditingIdea(idea) : undefined}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
