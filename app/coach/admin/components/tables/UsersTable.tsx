"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setUsers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (users.length === 0) {
    return <div className="p-6 text-center text-gray-500">No users found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Role</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Login Access</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {user.id.substring(0, 8)}...
              </td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    user.role === "coach"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-2">
                {user.has_auth_access ? (
                  <span className="text-green-600">✓ Yes</span>
                ) : (
                  <span className="text-gray-500">✗ No</span>
                )}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
