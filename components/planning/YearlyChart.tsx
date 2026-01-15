"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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

export function YearlyChart({
  events,
  year,
}: {
  events: Event[];
  year: number;
}) {
  // Create data for each month
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const data = monthNames.map((month, monthIndex) => {
    const eventsInMonth = events.filter((event) => {
      const eventDate = new Date(event.start_date);
      return eventDate.getMonth() === monthIndex;
    });
    return {
      name: month,
      events: eventsInMonth.length,
      month: monthIndex + 1,
    };
  });

  const totalEvents = data.reduce((sum, month) => sum + month.events, 0);
  const maxEvents = Math.max(...data.map((d) => d.events), 1);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded text-sm">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-indigo-300">
            {payload[0].value} {payload[0].value === 1 ? "event" : "events"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Total Events</div>
          <div className="text-2xl font-bold text-indigo-600">
            {totalEvents}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Peak Month</div>
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((max, month) =>
              month.events > max.events ? month : max
            ).name}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          <Bar dataKey="events" fill="#4f46e5" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.events === 0 ? "#e5e7eb" : "#4f46e5"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Average events per month:{" "}
          <span className="font-semibold text-gray-900">
            {(totalEvents / 12).toFixed(1)}
          </span>
        </p>
      </div>
    </div>
  );
}
