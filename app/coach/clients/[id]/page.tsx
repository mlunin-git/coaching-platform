"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { TaskCard } from "../components/TaskCard";
import { CreateTaskForm } from "../components/CreateTaskForm";
import { ClientInfoCard } from "../components/ClientInfoCard";
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

  const toggleTaskStatus = useCallback(async (taskIndex: number) => {
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
  }, [tasks]);

  if (loading || !clientInfo) {
    return (
      <div className="space-y-8">
        <div className="flex gap-4">
          <SkeletonLoader type="text" count={1} className="flex-1" />
          <SkeletonLoader type="text" count={1} className="w-32" />
        </div>
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
        <SkeletonLoader type="list" count={2} />
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
          aria-label="Back to clients list"
        >
          ← Back to Clients
        </button>
        <button
          onClick={() => router.push(`/coach/messages/${clientId}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          aria-label="Message client"
        >
          📨 Message Client
        </button>
      </div>

      {/* Client Info Card */}
      <ClientInfoCard
        client={clientInfo.client}
        userName={clientInfo.user.name}
        userEmail={clientInfo.user.email}
        taskCount={tasks.length}
      />

      {/* Create Task Form */}
      <CreateTaskForm clientId={clientId} onTaskCreated={loadTasks} />

      {/* Tasks List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Tasks for {clientInfo.user.name}</h3>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>No tasks yet. Create one using the form above!</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={() => toggleTaskStatus(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}
