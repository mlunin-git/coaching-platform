"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type CoachClient = Database["public"]["Tables"]["coach_clients"]["Row"];

export function ClientsTable() {
  const [clients, setClients] = useState<CoachClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("coach_clients")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setClients(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clients");
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading clients...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (clients.length === 0) {
    return <div className="p-6 text-center text-gray-500">No coach-client relationships found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Coach ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Client ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={`${client.coach_id}-${client.client_id}`} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(client.coach_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(client.client_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 text-gray-600">
                {client.created_at
                  ? new Date(client.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
