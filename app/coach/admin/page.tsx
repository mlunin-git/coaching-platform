"use client";

import { useState } from "react";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { AdminOverview } from "./components/AdminOverview";
import { DatabaseTables } from "./components/DatabaseTables";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";

type TabType = "overview" | "database" | "analytics";

/**
 * Admin Panel Main Page
 * Displays three tabs: Overview, Database, Analytics
 * Read-only view of all system data
 */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview" as TabType, label: "📊 Overview", icon: "📊" },
    { id: "database" as TabType, label: "🗄️ Database", icon: "🗄️" },
    { id: "analytics" as TabType, label: "📈 Analytics", icon: "📈" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          Read-only view of all database tables and analytics
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <nav className="flex gap-1 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        <SectionErrorBoundary section={`admin-${activeTab}`}>
          <div className="p-6">
            {activeTab === "overview" && <AdminOverview />}
            {activeTab === "database" && <DatabaseTables />}
            {activeTab === "analytics" && <AnalyticsDashboard />}
          </div>
        </SectionErrorBoundary>
      </div>
    </div>
  );
}
