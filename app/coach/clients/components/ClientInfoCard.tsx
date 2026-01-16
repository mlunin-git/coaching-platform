"use client";

import type { Database } from "@/lib/database.types";

type Client = Database["public"]["Tables"]["clients"]["Row"];

interface ClientInfoCardProps {
  client: Client;
  userName: string;
  userEmail: string | null;
  taskCount: number;
}

export function ClientInfoCard({
  client,
  userName,
  userEmail,
  taskCount,
}: ClientInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{userName}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Email</p>
          <p className="text-lg font-medium text-gray-900">
            {userEmail || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Added on</p>
          <p className="text-lg font-medium text-gray-900">
            {new Date(client.created_at).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Tasks</p>
          <p className="text-lg font-medium text-gray-900">{taskCount}</p>
        </div>
      </div>
    </div>
  );
}
