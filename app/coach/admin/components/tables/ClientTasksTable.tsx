"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type ClientTask = Database["public"]["Tables"]["client_tasks"]["Row"];

export function ClientTasksTable() {
  const [clientTasks, setClientTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientTasks() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("client_tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setClientTasks(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client tasks");
      } finally {
        setLoading(false);
      }
    }

    fetchClientTasks();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading client tasks...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (clientTasks.length === 0) {
    return <div className="p-6 text-center text-gray-500">No client tasks found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Client ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Task ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Completed</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {clientTasks.map((clientTask) => (
            <tr key={clientTask.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(clientTask.client_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(clientTask.task_id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    clientTask.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {clientTask.status === "completed" ? "Completed" : "Pending"}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-600">
                {clientTask.completed_at
                  ? new Date(clientTask.completed_at).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {clientTask.created_at
                  ? new Date(clientTask.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
