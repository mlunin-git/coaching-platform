"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface Participant {
  id: string;
  name: string;
  color: string;
}

interface ParticipantDropdownProps {
  participants: Participant[];
  selected: string | null;
  onSelect: (participantId: string) => void;
}

export function ParticipantDropdown({
  participants,
  selected,
  onSelect,
}: ParticipantDropdownProps) {
  const { t } = useLanguage();
  const selectedName = participants.find((p) => p.id === selected)?.name;

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
      onChange={(e) => onSelect(e.target.value)}
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
