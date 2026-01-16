"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface QuickStatsProps {
  eventsCount: number;
  ideasCount: number;
  participantsCount: number;
}

export function QuickStats({
  eventsCount,
  ideasCount,
  participantsCount,
}: QuickStatsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-4 border-l-4 border-yellow-600">
        <div className="text-xs text-gray-600">
          💡 Total Ideas
        </div>
        <div className="text-2xl font-bold text-yellow-600 mt-2">{ideasCount}</div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow p-4 border-l-4 border-indigo-600">
        <div className="text-xs text-gray-600">
          📅 Total Events
        </div>
        <div className="text-2xl font-bold text-indigo-600 mt-2">{eventsCount}</div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow p-4 border-l-4 border-emerald-600">
        <div className="text-xs text-gray-600">
          👥 Total Participants
        </div>
        <div className="text-2xl font-bold text-emerald-600 mt-2">
          {participantsCount}
        </div>
      </div>
    </div>
  );
}
