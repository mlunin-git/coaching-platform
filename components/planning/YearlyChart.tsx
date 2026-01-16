"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  creator?: { name: string; color?: string };
  planning_event_participants?: Array<{ id: string }>;
  attendee_count?: number;
}

export function YearlyChart({
  events,
  year,
}: {
  events: Event[];
  year: number;
}) {
  // Group events by year
  const eventsByYear = new Map<number, { planned: number; archived: number }>();

  events.forEach((event) => {
    const eventYear = new Date(event.start_date).getFullYear();
    if (!eventsByYear.has(eventYear)) {
      eventsByYear.set(eventYear, { planned: 0, archived: 0 });
    }
    const yearData = eventsByYear.get(eventYear)!;
    if (event.is_archived) {
      yearData.archived += 1;
    } else {
      yearData.planned += 1;
    }
  });

  // Create sorted array of years
  const years = Array.from(eventsByYear.keys()).sort((a, b) => a - b);
  const yearData = years.map((y) => ({
    name: y.toString(),
    planned: eventsByYear.get(y)?.planned || 0,
    archived: eventsByYear.get(y)?.archived || 0,
  }));

  // If no events, show current year as empty
  if (yearData.length === 0) {
    yearData.push({ name: year.toString(), planned: 0, archived: 0 });
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded text-sm">
          <p className="font-semibold">{data.name}</p>
          <p className="text-emerald-300">
            📅 Planned: {data.planned}
          </p>
          <p className="text-yellow-300">
            📦 Archived: {data.archived}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Events per Year</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={yearData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#999"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#999"
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="planned" fill="#10b981" radius={[8, 8, 0, 0]} stackId="a" />
          <Bar dataKey="archived" fill="#f59e0b" radius={[8, 8, 0, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
