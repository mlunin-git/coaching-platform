"use client";

import { useState } from "react";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { UsersTable } from "./tables/UsersTable";
import { ClientsTable } from "./tables/ClientsTable";
import { TasksTable } from "./tables/TasksTable";
import { ClientTasksTable } from "./tables/ClientTasksTable";
import { MessagesTable } from "./tables/MessagesTable";
import { PlanningGroupsTable } from "./tables/PlanningGroupsTable";
import { PlanningParticipantsTable } from "./tables/PlanningParticipantsTable";
import { PlanningIdeasTable } from "./tables/PlanningIdeasTable";
import { PlanningIdeaVotesTable } from "./tables/PlanningIdeaVotesTable";
import { PlanningEventsTable } from "./tables/PlanningEventsTable";
import { PlanningEventParticipantsTable } from "./tables/PlanningEventParticipantsTable";

type TableType =
  | "users"
  | "clients"
  | "tasks"
  | "client_tasks"
  | "messages"
  | "planning_groups"
  | "planning_participants"
  | "planning_ideas"
  | "planning_idea_votes"
  | "planning_events"
  | "planning_event_participants";

interface TableInfo {
  id: TableType;
  label: string;
  icon: string;
  description: string;
}

const tables: TableInfo[] = [
  {
    id: "users",
    label: "👤 Users",
    icon: "👤",
    description: "All coaches and clients",
  },
  {
    id: "clients",
    label: "👥 Clients",
    icon: "👥",
    description: "Coach-client relationships",
  },
  {
    id: "tasks",
    label: "✅ Tasks",
    icon: "✅",
    description: "Tasks created by coaches",
  },
  {
    id: "client_tasks",
    label: "📋 Client Tasks",
    icon: "📋",
    description: "Task assignments with status",
  },
  {
    id: "messages",
    label: "💬 Messages",
    icon: "💬",
    description: "Coach-client conversations",
  },
  {
    id: "planning_groups",
    label: "📅 Planning Groups",
    icon: "📅",
    description: "Year planning groups",
  },
  {
    id: "planning_participants",
    label: "👫 Participants",
    icon: "👫",
    description: "Group participants",
  },
  {
    id: "planning_ideas",
    label: "💡 Ideas",
    icon: "💡",
    description: "Event ideas",
  },
  {
    id: "planning_idea_votes",
    label: "🗳️ Votes",
    icon: "🗳️",
    description: "Idea votes",
  },
  {
    id: "planning_events",
    label: "🎪 Events",
    icon: "🎪",
    description: "Confirmed events",
  },
  {
    id: "planning_event_participants",
    label: "🎟️ Event Participants",
    icon: "🎟️",
    description: "Event attendance",
  },
];

/**
 * Database Tables Component
 * Displays all database tables with search and pagination
 */
export function DatabaseTables() {
  const [selectedTable, setSelectedTable] = useState<TableType>("users");

  const currentTable = tables.find((t) => t.id === selectedTable);

  return (
    <div className="space-y-6">
      {/* Table Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table.id)}
            className={`
              p-3 rounded-lg transition-all text-sm font-medium
              ${
                selectedTable === table.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-400"
              }
            `}
          >
            <div className="text-xl mb-1">{table.icon}</div>
            <div className="text-xs line-clamp-2">{table.label}</div>
          </button>
        ))}
      </div>

      {/* Selected Table Info */}
      {currentTable && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentTable.label}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{currentTable.description}</p>
        </div>
      )}

      {/* Table Content */}
      <SectionErrorBoundary section={`table-${selectedTable}`}>
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {selectedTable === "users" && <UsersTable />}
          {selectedTable === "clients" && <ClientsTable />}
          {selectedTable === "tasks" && <TasksTable />}
          {selectedTable === "client_tasks" && <ClientTasksTable />}
          {selectedTable === "messages" && <MessagesTable />}
          {selectedTable === "planning_groups" && <PlanningGroupsTable />}
          {selectedTable === "planning_participants" && (
            <PlanningParticipantsTable />
          )}
          {selectedTable === "planning_ideas" && <PlanningIdeasTable />}
          {selectedTable === "planning_idea_votes" && (
            <PlanningIdeaVotesTable />
          )}
          {selectedTable === "planning_events" && <PlanningEventsTable />}
          {selectedTable === "planning_event_participants" && (
            <PlanningEventParticipantsTable />
          )}
        </div>
      </SectionErrorBoundary>
    </div>
  );
}
