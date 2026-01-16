"use client";

import { useState } from "react";

interface CreateTaskFormProps {
  clientId: string;
  onTaskCreated: () => void;
}

export function CreateTaskForm({ clientId, onTaskCreated }: CreateTaskFormProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const { getSupabaseClient } = await import("@/lib/supabase");
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
      onTaskCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  return (
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
            maxLength={255}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value.slice(0, 2000))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Add details about the task..."
            rows={4}
            maxLength={2000}
          />
          <div className="mt-1 text-xs text-gray-500">
            {newTaskDescription.length}/2000 characters
          </div>
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
  );
}
