"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface ClientTask {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "completed";
  completed_at: string | null;
  created_at: string;
  clientTaskId: string;
}

interface ClientTaskWithTask {
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

interface ClientInfo {
  client: Client;
  user: {
    name: string;
    email: string | null;
  };
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadClientInfo = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: clientRaw, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      const client = clientRaw as Client | null;
      if (clientError || !client) throw new Error("Client not found");

      const { data: userRaw, error: userError } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", client.user_id)
        .single();

      const user = userRaw as { name: string; email: string } | null;
      if (userError || !user) throw new Error("User not found");

      setClientInfo({
        client,
        user: {
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load client info");
    }
  }, [clientId]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
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
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;

      const transformedTasks = (data as ClientTaskWithTask[] || []).map((item) => ({
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
  }, [clientId]);

  useEffect(() => {
    loadClientInfo();
    loadTasks();
  }, [clientId, loadClientInfo, loadTasks]);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Create task for this coach
      const { data: newTask, error: taskError } = await supabase
        .from("tasks")
        .insert({
          coach_id: user.id,
          title: newTaskTitle,
          description: newTaskDescription,
        })
        .select()
        .single();

      if (taskError) throw taskError;
      if (!newTask) throw new Error("Failed to create task");

      // Create client_task for this specific client
      const { error: clientTaskError } = await supabase
        .from("client_tasks")
        .insert({
          client_id: clientId,
          task_id: newTask.id,
          status: "pending",
        });

      if (clientTaskError) throw clientTaskError;

      setNewTaskTitle("");
      setNewTaskDescription("");
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  async function toggleTaskStatus(taskIndex: number) {
    const task = tasks[taskIndex];
    const newStatus = task.status === "pending" ? "completed" : "pending";

    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase
        .from("client_tasks")
        .update({
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", task.clientTaskId);

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
    }
  }

  if (loading || !clientInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button and header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Clients
        </button>
        <button
          onClick={() => router.push(`/coach/messages/${clientId}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          📨 Message Client
        </button>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{clientInfo.user.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-medium text-gray-900">
              {clientInfo.user.email || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Added on</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(clientInfo.client.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-lg font-medium text-gray-900">{tasks.length}</p>
          </div>
        </div>
      </div>

      {/* Create Task Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Complete the workbook"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Add details about the task..."
              rows={4}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {creating ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Tasks for {clientInfo.user.name}</h3>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>No tasks yet. Create one using the form above!</p>
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
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    task.status === "completed"
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {task.status === "completed" && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </button>

                <div className="flex-1">
                  <h4
                    className={`font-semibold ${
                      task.status === "completed"
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </h4>
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
