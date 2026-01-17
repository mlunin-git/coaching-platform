"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type PlanningGroup = Database["public"]["Tables"]["planning_groups"]["Row"];

export function PlanningGroupsTable() {
  const [groups, setGroups] = useState<PlanningGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("planning_groups")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setGroups(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load groups");
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading planning groups...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (groups.length === 0) {
    return <div className="p-6 text-center text-gray-500">No planning groups found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Coach ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Access Token</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{group.name}</td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(group.coach_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(group.access_token as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 text-gray-600">
                {group.created_at
                  ? new Date(group.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
