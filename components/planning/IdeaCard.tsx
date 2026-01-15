"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface Participant {
  name: string;
  color: string;
}

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    description: string;
    location: string;
    participant: Participant;
    vote_count: number;
  };
  isOwner: boolean;
  hasVoted: boolean;
  onVote: () => void;
}

export function IdeaCard({
  idea,
  isOwner,
  hasVoted,
  onVote,
}: IdeaCardProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4">
      <div className="flex gap-4">
        {/* Color indicator */}
        <div
          className="w-3 h-full rounded-l-lg"
          style={{ backgroundColor: idea.participant.color }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {idea.title}
          </h3>
          {idea.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {idea.description}
            </p>
          )}
          {idea.location && (
            <p className="text-xs text-gray-500 mt-2">📍 {idea.location}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            by <span className="font-medium">{idea.participant.name}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 items-end">
          <button
            onClick={onVote}
            className={`px-3 py-2 rounded-lg transition-all font-medium text-sm ${
              hasVoted
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👍 {idea.vote_count}
          </button>
          {isOwner && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {t("planning.ideas.your")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
