"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import { GroupForm } from "@/components/planning/GroupForm";
import { GroupList } from "@/components/planning/GroupList";

interface PlanningGroup {
  id: string;
  name: string;
  access_token: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<PlanningGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    const supabase = getSupabaseClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    // Get coach's user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", session.user.id)
      .single();

    if (!userData) {
      setLoading(false);
      return;
    }

    // Fetch coach's groups
    const { data, error } = await supabase
      .from("planning_groups")
      .select("*")
      .eq("coach_id", userData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching groups:", error);
    } else {
      setGroups(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = () => {
    setShowForm(false);
    fetchGroups();
  };

  const handleGroupDeleted = () => {
    fetchGroups();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900">
          {t("planning.title")}
        </h1>
        <p className="text-lg text-gray-600">
          {t("planning.admin.createGroup")}
        </p>
      </div>

      {/* Create Group Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-medium"
          >
            + {t("planning.admin.createGroup")}
          </button>
        ) : (
          <GroupForm onSuccess={handleGroupCreated} onCancel={() => setShowForm(false)} />
        )}
      </div>

      {/* Groups List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-600 text-lg">
            {t("planning.admin.noGroups")}
          </p>
        </div>
      ) : (
        <GroupList groups={groups} onGroupDeleted={handleGroupDeleted} />
      )}
    </div>
  );
}
