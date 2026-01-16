"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface Creator {
  name: string;
  color?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  city?: string;
  country?: string;
  is_archived: boolean;
  group_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator?: Creator;
  planning_event_participants?: Array<{ id: string }>;
  attendee_count?: number;
}

interface EventsListProps {
  events: Event[];
  selectedParticipantId?: string | null;
  onEdit?: (event: Event) => void;
  onArchive?: (eventId: string) => void;
  onUnarchive?: (eventId: string) => void;
  onMarkAttending?: (eventId: string) => void;
  onDemote?: (eventId: string) => void;
  attendingEventIds?: Set<string>;
}

export function EventsList({
  events,
  selectedParticipantId,
  onEdit,
  onArchive,
  onUnarchive,
  onMarkAttending,
  onDemote,
  attendingEventIds,
}: EventsListProps) {
  const { t } = useLanguage();

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("planning.events.noEvents")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const isAttending = attendingEventIds?.has(event.id) ?? false;
        return (
          <div
            key={event.id}
            className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-3 sm:p-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Color indicator */}
              {event.creator?.color && (
                <div
                  className="w-3 h-full rounded-l-lg"
                  style={{ backgroundColor: event.creator.color }}
                />
              )}

              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-2 sm:justify-between">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-600">
                      <span>📅 {new Date(event.start_date).toLocaleDateString()}</span>
                      {event.end_date && (
                        <span>→ {new Date(event.end_date).toLocaleDateString()}</span>
                      )}
                      {event.location && <span>📍 {event.location}</span>}
                      {event.city && <span>🏙️ {event.city}</span>}
                    </div>

                    {event.creator && (
                      <p className="text-xs text-gray-500 mt-3">
                        by <span className="font-medium">{event.creator.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:flex-col gap-2 w-full sm:w-auto sm:items-end">
                    {selectedParticipantId && onMarkAttending && (
                      <button
                        onClick={() => onMarkAttending(event.id)}
                        className={`w-full sm:w-auto px-3 py-2 sm:py-1 rounded-lg transition-all font-medium text-sm ${
                          isAttending
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {isAttending ? "✓ Attending" : "Attending?"}
                      </button>
                    )}

                    <div className="flex gap-1 w-full sm:w-auto">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(event)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="Edit event"
                        >
                          ✏️
                        </button>
                      )}
                      {onArchive && !event.is_archived && (
                        <button
                          onClick={() => onArchive(event.id)}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                          title="Archive event"
                        >
                          📦
                        </button>
                      )}
                      {onUnarchive && event.is_archived && (
                        <button
                          onClick={() => onUnarchive(event.id)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          title="Unarchive event"
                        >
                          ↩️
                        </button>
                      )}
                      {onDemote && (
                        <button
                          onClick={() => onDemote(event.id)}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                          title="Convert back to idea"
                        >
                          ↙️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
