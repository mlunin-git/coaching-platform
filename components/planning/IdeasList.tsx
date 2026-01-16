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
  selectedParticipantId: string;
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

  // Sort ideas by vote count
  const sortedIdeas = [...ideas].sort((a, b) => b.vote_count - a.vote_count);

  const handleVote = async (ideaId: string) => {
    setLoading(true);
    const supabase = getSupabaseClient();

    try {
      // Check if already voted
      const hasVoted = await hasParticipantVoted(ideaId, selectedParticipantId);

      if (hasVoted) {
        // Remove vote
        await supabase
          .from("planning_idea_votes")
          .delete()
          .eq("idea_id", ideaId)
          .eq("participant_id", selectedParticipantId);

        setUserVotes((prev) => {
          const next = new Set(prev);
          next.delete(ideaId);
          return next;
        });
      } else {
        // Add vote
        await supabase.from("planning_idea_votes").insert({
          idea_id: ideaId,
          participant_id: selectedParticipantId,
        });

        setUserVotes((prev) => new Set([...prev, ideaId]));
      }

      onDataRefresh();
    } catch {
      // Vote action failed - silently continue
    }

    setLoading(false);
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (
      !confirm(
        t("planning.ideas.deleteIdea") + "? This cannot be undone."
      )
    ) {
      return;
    }

    const supabase = getSupabaseClient();

    try {
      // Delete all votes for this idea first
      await supabase.from("planning_idea_votes").delete().eq("idea_id", ideaId);

      // Delete the idea
      await supabase.from("planning_ideas").delete().eq("id", ideaId);

      onDataRefresh();
    } catch (err) {
      alert("Error deleting idea");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Idea Form */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedIdeas.map((idea) => {
            const isOwner = idea.participant_id === selectedParticipantId;
            return (
              <IdeaCard
                key={idea.id}
                idea={idea}
                isOwner={isOwner}
                hasVoted={userVotes.has(idea.id)}
                selectedParticipantId={selectedParticipantId}
                onVote={() => handleVote(idea.id)}
                onPromote={isOwner ? () => setPromoteModalIdea(idea) : undefined}
                onEdit={isOwner ? () => setEditingIdea(idea) : undefined}
                onDelete={isOwner ? () => handleDeleteIdea(idea.id) : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
