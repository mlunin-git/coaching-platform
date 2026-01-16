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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Left section: Color indicator and Content */}
        <div className="flex flex-1 gap-3 sm:gap-4 min-w-0">
          {/* Color indicator */}
          {idea.participant?.color && (
            <div
              className="w-3 rounded-lg flex-shrink-0"
              style={{ backgroundColor: idea.participant.color }}
            />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex-1 break-words">
                  {idea.title}
                </h3>
                {isPromoted && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded whitespace-nowrap flex-shrink-0">
                    ✓ {t("planning.ideas.promoted")}
                  </span>
                )}
              </div>
              {idea.description && (
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {idea.description}
                </p>
              )}
              {idea.location && (
                <p className="text-xs text-gray-500">📍 {idea.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar: Actions and metadata */}
        <div className="flex flex-col gap-2 w-full lg:w-auto lg:border-l lg:border-gray-200 lg:pl-4 pt-2 lg:pt-0">
          {/* Buttons section */}
          <div className="flex gap-2 flex-wrap lg:flex-col">
            {/* Vote button */}
            <button
              onClick={onVote}
              disabled={!selectedParticipantId}
              className={`flex-1 lg:flex-initial lg:w-full px-3 py-2 rounded-lg transition-all font-medium text-sm ${
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
                    className="flex-1 lg:flex-initial lg:w-full px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    title="Edit idea"
                  >
                    ✏️ Edit
                  </button>
                )}
                {!isPromoted && onPromote && (
                  <button
                    onClick={onPromote}
                    className="flex-1 lg:flex-initial lg:w-full px-2 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                    title="Promote to event"
                  >
                    🚀 Promote
                  </button>
                )}
              </>
            )}
          </div>

          {/* Creator and Last Updated info */}
          <div className="flex flex-col gap-1 pt-2 border-t border-gray-200 text-xs text-gray-500">
            {idea.participant && (
              <p>
                Created by <span className="font-medium">{idea.participant.name}</span>
              </p>
            )}
            <p>
              Updated {formatDate(idea.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
