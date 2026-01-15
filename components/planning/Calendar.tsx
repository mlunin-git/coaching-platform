"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MonthView } from "./MonthView";

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

export function Calendar({
  events,
  participants,
}: {
  events: Event[];
  participants: Participant[];
}) {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentYear, currentMonth - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentYear, currentMonth + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <p className="text-gray-600">
            {events.length} {events.length === 1 ? "event" : "events"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousMonth}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Month View */}
      <MonthView
        date={currentDate}
        events={events}
        participants={participants}
      />

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Event Creators</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: participant.color }}
              />
              <span className="text-sm text-gray-700">{participant.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
