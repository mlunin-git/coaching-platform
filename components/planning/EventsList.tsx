"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface Creator {
  name: string;
  color: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  city: string;
  creator: Creator;
}

interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
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
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4"
        >
          <div className="flex gap-4">
            {/* Color indicator */}
            <div
              className="w-3 h-full rounded-l-lg"
              style={{ backgroundColor: event.creator.color }}
            />

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                <span>📅 {new Date(event.start_date).toLocaleDateString()}</span>
                {event.location && <span>📍 {event.location}</span>}
                {event.city && <span>🏙️ {event.city}</span>}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                by <span className="font-medium">{event.creator.name}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
