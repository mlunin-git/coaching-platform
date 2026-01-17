"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Vote = Database["public"]["Tables"]["planning_idea_votes"]["Row"];

export function PlanningIdeaVotesTable() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVotes() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("planning_idea_votes")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setVotes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load votes");
      } finally {
        setLoading(false);
      }
    }

    fetchVotes();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading votes...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (votes.length === 0) {
    return <div className="p-6 text-center text-gray-500">No votes found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Vote ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Idea ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Participant ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Voted</th>
          </tr>
        </thead>
        <tbody>
          {votes.map((vote) => (
            <tr key={vote.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(vote.id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(vote.idea_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(vote.participant_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 text-gray-600">
                {vote.created_at
                  ? new Date(vote.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
