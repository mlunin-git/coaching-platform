"use client";

import { useState } from "react";
import { EventTooltip } from "./EventTooltip";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  city: string;
  creator: { name: string; color: string };
}

interface Participant {
  id: string;
  name: string;
  color: string;
}

export function DayCell({
  day,
  events,
  isToday,
  participants,
}: {
  day: number | null;
  events: Event[];
  isToday: boolean;
  participants: Participant[];
}) {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  if (day === null) {
    return <div className="bg-gray-50 border-r border-b min-h-[120px]" />;
  }

  return (
    <div
      className={`border-r border-b min-h-[120px] p-2 relative transition-colors ${
        isToday ? "bg-yellow-50" : "bg-white hover:bg-gray-50"
      }`}
    >
      {/* Day number */}
      <div
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full mb-2 font-semibold ${
          isToday
            ? "bg-indigo-600 text-white"
            : "text-gray-700 bg-gray-100"
        }`}
      >
        {day}
      </div>

      {/* Events */}
      <div className="space-y-1">
        {events.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="relative group"
            onMouseEnter={() => setHoveredEventId(event.id)}
            onMouseLeave={() => setHoveredEventId(null)}
          >
            <div
              className="text-xs px-2 py-1 rounded cursor-pointer text-white truncate transition-all hover:shadow-md"
              style={{
                backgroundColor: event.creator.color,
                opacity: hoveredEventId === event.id ? 1 : 0.85,
              }}
            >
              {event.title}
            </div>

            {/* Tooltip */}
            {hoveredEventId === event.id && (
              <EventTooltip event={event} />
            )}
          </div>
        ))}

        {/* Overflow indicator */}
        {events.length > 3 && (
          <div className="text-xs text-gray-600 px-2 py-1 font-medium">
            +{events.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}
