"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface QuickStatsProps {
  plannedEvents: number;
  archivedEvents: number;
  ideasCount: number;
  participantsCount: number;
}

export function QuickStats({
  plannedEvents,
  archivedEvents,
  ideasCount,
  participantsCount,
}: QuickStatsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-3 sm:p-4 border-l-4 border-yellow-600">
        <div className="text-xs sm:text-sm text-gray-600">
          💡 {t("planning.participant.ideas")}
        </div>
        <div className="text-xl sm:text-2xl font-bold text-yellow-600 mt-2">{ideasCount}</div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow p-3 sm:p-4 border-l-4 border-emerald-600">
        <div className="text-xs sm:text-sm text-gray-600">
          📅 Planned
        </div>
        <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-2">{plannedEvents}</div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow p-3 sm:p-4 border-l-4 border-amber-600">
        <div className="text-xs sm:text-sm text-gray-600">
          📦 Archived
        </div>
        <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-2">
          {archivedEvents}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-3 sm:p-4 border-l-4 border-blue-600">
        <div className="text-xs sm:text-sm text-gray-600">
          👥 Participants
        </div>
        <div className="text-xl sm:text-2xl font-bold text-blue-600 mt-2">
          {participantsCount}
        </div>
      </div>
    </div>
  );
}
