"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Idea = Database["public"]["Tables"]["planning_ideas"]["Row"];

export function PlanningIdeasTable() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIdeas() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("planning_ideas")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setIdeas(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ideas");
      } finally {
        setLoading(false);
      }
    }

    fetchIdeas();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading ideas...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (ideas.length === 0) {
    return <div className="p-6 text-center text-gray-500">No ideas found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Title</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Participant</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Group</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Location</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Promoted</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => (
            <tr key={idea.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 truncate">{idea.title}</td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(idea.participant_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(idea.group_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 text-gray-600">{idea.location || "-"}</td>
              <td className="px-4 py-2">
                {idea.promoted_to_event_id ? (
                  <span className="text-green-600">✓ Yes</span>
                ) : (
                  <span className="text-gray-500">✗ No</span>
                )}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {idea.created_at
                  ? new Date(idea.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
