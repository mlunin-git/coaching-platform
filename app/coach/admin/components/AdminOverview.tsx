"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/logger";

interface OverviewStats {
  totalUsers: number;
  totalCoaches: number;
  totalClients: number;
  totalTasks: number;
  completedTasks: number;
  totalMessages: number;
  recentMessages: number;
  totalPlanningGroups: number;
  totalIdeas: number;
  totalEvents: number;
}

/**
 * Admin Overview Component
 * Displays summary statistics about the platform
 */
export function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const supabase = getSupabaseClient();

        // Load all statistics in parallel
        const [
          usersResult,
          coachesResult,
          clientsResult,
          tasksResult,
          completedTasksResult,
          messagesResult,
          recentMessagesResult,
          groupsResult,
          ideasResult,
          eventsResult,
        ] = await Promise.all([
          supabase
            .from("users")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("role", "coach"),
          supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("role", "client"),
          supabase
            .from("tasks")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("client_tasks")
            .select("*", { count: "exact", head: true })
            .eq("status", "completed"),
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .gte(
              "created_at",
              new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            ),
          supabase
            .from("planning_groups")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("planning_ideas")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("planning_events")
            .select("*", { count: "exact", head: true }),
        ]);

        setStats({
          totalUsers: usersResult.count || 0,
          totalCoaches: coachesResult.count || 0,
          totalClients: clientsResult.count || 0,
          totalTasks: tasksResult.count || 0,
          completedTasks: completedTasksResult.count || 0,
          totalMessages: messagesResult.count || 0,
          recentMessages: recentMessagesResult.count || 0,
          totalPlanningGroups: groupsResult.count || 0,
          totalIdeas: ideasResult.count || 0,
          totalEvents: eventsResult.count || 0,
        });
      } catch (err) {
        logger.error("Failed to load overview stats", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return <div className="text-center text-red-600 py-12">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* User Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Coaches"
          value={stats.totalCoaches}
          icon="🎯"
          color="indigo"
        />
        <StatCard
          title="Clients"
          value={stats.totalClients}
          icon="📊"
          color="green"
        />
        <StatCard
          title="Tasks"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          icon="✅"
          color="purple"
        />
      </div>

      {/* Messaging Statistics */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Messaging Activity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">
              Total Messages
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {stats.totalMessages}
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">
              Last 24 Hours
            </div>
            <div className="text-3xl font-bold text-green-900">
              {stats.recentMessages}
            </div>
          </div>
        </div>
      </div>

      {/* Year Planning Statistics */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Year Planning Activity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-600 font-medium mb-1">
              Planning Groups
            </div>
            <div className="text-3xl font-bold text-orange-900">
              {stats.totalPlanningGroups}
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium mb-1">
              Ideas Submitted
            </div>
            <div className="text-3xl font-bold text-yellow-900">
              {stats.totalIdeas}
            </div>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <div className="text-sm text-pink-600 font-medium mb-1">
              Events Confirmed
            </div>
            <div className="text-3xl font-bold text-pink-900">
              {stats.totalEvents}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow p-6 border border-indigo-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Platform Summary
        </h3>
        <div className="text-gray-700 space-y-2">
          <p>
            Your coaching platform has{" "}
            <strong>{stats.totalUsers} total users</strong> ({stats.totalCoaches}{" "}
            coaches, {stats.totalClients} clients)
          </p>
          <p>
            <strong>{stats.completedTasks}</strong> of{" "}
            <strong>{stats.totalTasks}</strong> tasks completed (
            {stats.totalTasks > 0
              ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
              : 0}
            %)
          </p>
          <p>
            <strong>{stats.totalMessages}</strong> messages exchanged, with{" "}
            <strong>{stats.recentMessages}</strong> in the last 24 hours
          </p>
          <p>
            <strong>{stats.totalPlanningGroups}</strong> planning groups with{" "}
            <strong>{stats.totalIdeas}</strong> ideas and{" "}
            <strong>{stats.totalEvents}</strong> confirmed events
          </p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "blue" | "indigo" | "green" | "purple";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-600 text-blue-600",
    indigo: "from-indigo-50 to-indigo-100 border-indigo-600 text-indigo-600",
    green: "from-green-50 to-green-100 border-green-600 text-green-600",
    purple: "from-purple-50 to-purple-100 border-purple-600 text-purple-600",
  };

  const textColorMap = {
    blue: "text-blue-600",
    indigo: "text-indigo-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg shadow p-4 border-l-4`}
    >
      <div className="text-sm text-gray-600 mb-1">
        {icon} {title}
      </div>
      <div className={`text-2xl font-bold ${textColorMap[color]} mt-1`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
