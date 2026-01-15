"use client";

import { DayCell } from "./DayCell";

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

export function MonthView({
  date,
  events,
  participants,
}: {
  date: Date;
  events: Event[];
  participants: Participant[];
}) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create array of days to display
  const days: (number | null)[] = [];

  // Add empty slots for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Helper function to get events for a specific day
  const getEventsForDay = (day: number | null): Event[] => {
    if (day === null) return [];

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return events.filter((event) => {
      const startDate = event.start_date.split("T")[0];
      const endDate = event.end_date ? event.end_date.split("T")[0] : startDate;

      // Check if event falls within this day
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  // Check if day is today
  const isToday = (day: number | null): boolean => {
    if (day === null) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 bg-gray-100 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-4 py-3 text-center font-semibold text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <DayCell
            key={`${month}-${index}`}
            day={day}
            events={getEventsForDay(day)}
            isToday={isToday(day)}
            participants={participants}
          />
        ))}
      </div>
    </div>
  );
}
