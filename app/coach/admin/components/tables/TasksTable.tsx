"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export function TasksTable() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setTasks(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (tasks.length === 0) {
    return <div className="p-6 text-center text-gray-500">No tasks found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Title</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Coach ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(task.id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 truncate">{task.title}</td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(task.coach_id as string)?.substring(0, 8)}...
              </td>
              <td className="px-4 py-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    task.is_completed
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {task.is_completed ? "Completed" : "Pending"}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-600">
                {task.created_at
                  ? new Date(task.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
