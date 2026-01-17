"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { logger } from "@/lib/logger";

interface Participant {
  id: string;
  name: string;
  color: string | null;
}

interface ParticipantDropdownProps {
  participants: Participant[];
  selected: string | null;
  onSelect: (participantId: string) => void | Promise<void>;
}

export function ParticipantDropdown({
  participants,
  selected,
  onSelect,
}: ParticipantDropdownProps) {
  const { t } = useLanguage();
  const selectedName = participants.find((p) => p.id === selected)?.name;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const result = onSelect(e.target.value);
    // Handle both sync and async callbacks without blocking
    if (result instanceof Promise) {
      result.catch((error) => {
        logger.error("Error selecting participant:", error);
      });
    }
  };

  if (participants.length === 0) {
    return (
      <div className="text-sm text-yellow-700">
        ⚠️ {t("planning.validation.noParticipants")}
      </div>
    );
  }

  return (
    <select
      value={selected || ""}
      onChange={handleChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-medium"
    >
      <option value="">{t("planning.participant.selectName")}</option>
      {participants.map((participant) => (
        <option key={participant.id} value={participant.id}>
          {participant.name}
        </option>
      ))}
    </select>
  );
}
