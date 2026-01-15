"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface Participant {
  id: string;
  name: string;
  color: string;
}

interface ParticipantSelectorProps {
  participants: Participant[];
  selected: string | null;
  onSelect: (participantId: string) => void;
  groupId: string;
}

export function ParticipantSelector({
  participants,
  selected,
  onSelect,
  groupId,
}: ParticipantSelectorProps) {
  const { t } = useLanguage();
  const selectedName = participants.find((p) => p.id === selected)?.name;

  if (participants.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-900 font-medium">
          ⚠️ {t("planning.validation.noParticipants")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {t("planning.participant.selectName")}
      </label>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {participants.map((participant) => (
          <button
            key={participant.id}
            onClick={() => onSelect(participant.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selected === participant.id
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div
              className="w-full h-3 rounded-full mb-2"
              style={{ backgroundColor: participant.color }}
            />
            <span
              className={`text-sm font-medium ${
                selected === participant.id
                  ? "text-indigo-900"
                  : "text-gray-900"
              }`}
            >
              {participant.name}
            </span>
          </button>
        ))}
      </div>

      {selectedName && (
        <p className="mt-4 text-sm text-indigo-600 font-medium">
          ✓ {t("planning.participant.you")}: {selectedName}
        </p>
      )}
    </div>
  );
}
