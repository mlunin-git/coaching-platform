"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import { ShareLink } from "./ShareLink";
import { GroupDetails } from "./GroupDetails";

interface PlanningGroup {
  id: string;
  name: string;
  access_token: string;
  created_at: string;
  updated_at: string;
}

interface GroupListProps {
  groups: PlanningGroup[];
  onGroupDeleted: () => void;
}

export function GroupList({ groups, onGroupDeleted }: GroupListProps) {
  const { t } = useLanguage();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteGroup = async (groupId: string) => {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("planning_groups")
      .delete()
      .eq("id", groupId);

    if (!error) {
      setDeleteConfirm(null);
      onGroupDeleted();
    }
  };

  // If a group is selected, show its details
  if (selectedGroupId) {
    const group = groups.find((g) => g.id === selectedGroupId);
    if (group) {
      return (
        <GroupDetails
          group={group}
          onBack={() => setSelectedGroupId(null)}
          onGroupUpdated={onGroupDeleted}
        />
      );
    }
  }

  return (
    <div className="grid gap-6">
      {groups.map((group) => (
        <div
          key={group.id}
          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {t("common.created")}: {new Date(group.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedGroupId(group.id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                {t("planning.admin.manage")}
              </button>
              {deleteConfirm !== group.id && (
                <button
                  onClick={() => setDeleteConfirm(group.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  {t("common.delete")}
                </button>
              )}
            </div>
          </div>

          {deleteConfirm === group.id && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 flex gap-3 items-center">
              <span className="text-red-700 text-sm flex-1">
                {t("planning.admin.deleteConfirm")}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 py-1 bg-gray-300 text-gray-900 rounded text-sm font-medium hover:bg-gray-400"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          )}

          {/* Share Link Preview */}
          <ShareLink accessToken={group.access_token} />
        </div>
      ))}
    </div>
  );
}
