"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import { hasParticipantVoted } from "@/lib/planning";
import { IdeaCard } from "./IdeaCard";
import { IdeaForm } from "./IdeaForm";

interface Participant {
  name: string;
  color: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  location: string;
  participant: Participant;
  participant_id: string;
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
    } catch (error) {
      console.error("Error voting:", error);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Create Idea Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-medium"
        >
          + {t("planning.ideas.createIdea")}
        </button>
      ) : (
        <IdeaForm
          groupId={groupId}
          participantId={selectedParticipantId}
          onSuccess={() => {
            setShowForm(false);
            onDataRefresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Ideas List */}
      {sortedIdeas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {t("planning.validation.noParticipants")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isOwner={idea.participant_id === selectedParticipantId}
              hasVoted={userVotes.has(idea.id)}
              onVote={() => handleVote(idea.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
