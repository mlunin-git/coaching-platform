"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type EventParticipant = Database["public"]["Tables"]["planning_event_participants"]["Row"];

export function PlanningEventParticipantsTable() {
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParticipants() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("planning_event_participants")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setParticipants(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event participants");
      } finally {
        setLoading(false);
      }
    }

    fetchParticipants();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading event participants...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (participants.length === 0) {
    return <div className="p-6 text-center text-gray-500">No event participants found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Participant ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Event ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Registered</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => (
            <tr key={`${participant.event_id}-${participant.participant_id}`} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(participant.participant_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(participant.event_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 text-gray-600">
                {participant.created_at
                  ? new Date(participant.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
