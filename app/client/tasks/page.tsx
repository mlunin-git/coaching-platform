"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

interface TaskWithCompletion {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "completed";
  completed_at: string | null;
  created_at: string;
}

interface ClientTaskData {
  id: string;
  status: "pending" | "completed";
  completed_at: string | null;
  tasks: {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
  };
}

export default function ClientTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Get client record
      const { data: clientDataRaw, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const clientData = clientDataRaw as { id: string } | null;
      if (clientError || !clientData) {
        setError("Could not find your client record");
        return;
      }

      // Get tasks with completion status
      const { data, error: tasksError } = await supabase
        .from("client_tasks")
        .select(
          `
          id,
          status,
          completed_at,
          tasks:task_id (
            id,
            title,
            description,
            created_at
          )
        `
        )
        .eq("client_id", clientData.id)
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;

      // Transform data
      const transformedTasks = (data || []).map((item: ClientTaskData) => ({
        id: item.tasks.id,
        clientTaskId: item.id,
        title: item.tasks.title,
        description: item.tasks.description,
        status: item.status,
        completed_at: item.completed_at,
        created_at: item.tasks.created_at,
      }));

      setTasks(transformedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function toggleTaskStatus(taskIndex: number) {
    const task = tasks[taskIndex];
    const newStatus = task.status === "pending" ? "completed" : "pending";
    setUpdating(task.id);

    try {
      const supabase = getSupabaseClient();
      // Get client_task id (need to fetch again or track it)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Find the client_task record
      const { data: clientDataRaw } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const clientData = clientDataRaw as { id: string } | null;
      if (!clientData) throw new Error("Client not found");

      const { data: clientTask } = await supabase
        .from("client_tasks")
        .select("id")
        .eq("client_id", clientData.id)
        .eq("task_id", task.id)
        .single();

      if (!clientTask) throw new Error("Task not found");

      // Update status
      const updateData = {
        status: newStatus,
        completed_at: newStatus === "completed" ? new Date().toISOString() : null,
      };
      const { error: updateError } = await supabase
        .from("client_tasks")
        .update(updateData)
        .eq("id", clientTask.id);

      if (updateError) throw updateError;

      // Update local state
      const newTasks = [...tasks];
      newTasks[taskIndex] = {
        ...newTasks[taskIndex],
        status: newStatus,
        completed_at: newStatus === "completed" ? new Date().toISOString() : null,
      };
      setTasks(newTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Tasks</h2>
        <p className="text-gray-600">Complete your assigned tasks</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            {completedCount} of {tasks.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{completionPercentage}% complete</p>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>No tasks yet. Check back soon!</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow p-6 transition-all ${
                task.status === "completed" ? "bg-green-50 border-l-4 border-green-500" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTaskStatus(index)}
                  disabled={updating === task.id}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    task.status === "completed"
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {task.status === "completed" && (
                    <span className="text-white text-sm" aria-label="task completed">✓</span>
                  )}
                </button>

                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      task.status === "completed"
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-500">
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </span>
                    {task.completed_at && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Completed {new Date(task.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
