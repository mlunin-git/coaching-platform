"use client";

import { useLanguage } from "@/contexts/LanguageContext";

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

interface IdeaCardProps {
  idea: Idea;
  isOwner: boolean;
  hasVoted: boolean;
  selectedParticipantId: string | null;
  onVote: () => void;
  onPromote?: () => void;
  onEdit?: () => void;
}

export function IdeaCard({
  idea,
  isOwner,
  hasVoted,
  selectedParticipantId,
  onVote,
  onPromote,
  onEdit,
}: IdeaCardProps) {
  const { t } = useLanguage();
  const isPromoted = !!idea.promoted_to_event_id;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4">
      <div className="flex gap-4">
        {/* Color indicator */}
        {idea.participant?.color && (
          <div
            className="w-3 h-full rounded-l-lg"
            style={{ backgroundColor: idea.participant.color }}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="text-lg font-bold text-gray-900 truncate flex-1">
              {idea.title}
            </h3>
            {isPromoted && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded whitespace-nowrap">
                ✓ {t("planning.ideas.promoted")}
              </span>
            )}
          </div>
          {idea.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {idea.description}
            </p>
          )}
          {idea.location && (
            <p className="text-xs text-gray-500 mt-2">📍 {idea.location}</p>
          )}
          {idea.participant && (
            <p className="text-xs text-gray-500 mt-2">
              by <span className="font-medium">{idea.participant.name}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 items-center flex-wrap justify-end">
          {/* Vote button */}
          <button
            onClick={onVote}
            disabled={!selectedParticipantId}
            className={`px-3 py-2 rounded-lg transition-all font-medium text-sm ${
              hasVoted
                ? "bg-indigo-600 text-white"
                : selectedParticipantId
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            title={!selectedParticipantId ? "Select your name to vote" : ""}
          >
            👍 {idea.vote_count}
          </button>

          {/* Owner actions */}
          {isOwner && (
            <>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="Edit idea"
                >
                  ✏️
                </button>
              )}
              {!isPromoted && onPromote && (
                <button
                  onClick={onPromote}
                  className="px-2 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                  title="Promote to event"
                >
                  🚀
                </button>
              )}
            </>
          )}

          {/* Non-owner status */}
          {!isOwner && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {idea.participant?.name || "Anonymous"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
