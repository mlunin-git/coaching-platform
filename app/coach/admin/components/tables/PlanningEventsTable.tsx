"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type PlanningEvent = Database["public"]["Tables"]["planning_events"]["Row"];

export function PlanningEventsTable() {
  const [events, setEvents] = useState<PlanningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("planning_events")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setEvents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading events...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (events.length === 0) {
    return <div className="p-6 text-center text-gray-500">No events found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Title</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Group</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Location</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Start Date</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">End Date</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 truncate">{event.title}</td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(event.group_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2">{event.location || "-"}</td>
              <td className="px-4 py-2 text-gray-600">
                {event.start_date
                  ? new Date(event.start_date as string).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {event.end_date
                  ? new Date(event.end_date as string).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {event.created_at
                  ? new Date(event.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
