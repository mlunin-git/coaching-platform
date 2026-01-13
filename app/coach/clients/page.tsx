"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Client = Database["public"]["Tables"]["clients"]["Row"];

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const supabase = getSupabaseClient();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("coach_id", user.id);

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Create user for client
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newClientEmail,
        password: Math.random().toString(36).slice(-12), // Random password
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: newClientEmail,
        name: newClientName,
        role: "client",
      });

      if (profileError) throw profileError;

      // Create client record
      const { error: clientError } = await supabase.from("clients").insert({
        coach_id: user.id,
        user_id: authData.user.id,
        name: newClientName,
      });

      if (clientError) throw clientError;

      setNewClientName("");
      setNewClientEmail("");
      loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add client");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Clients</h2>
        <p className="text-gray-600">Add new clients to your coaching program</p>
      </div>

      {/* Add Client Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Client</h3>
        <form onSubmit={handleAddClient} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={adding}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {adding ? "Adding..." : "Add Client"}
          </button>
        </form>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Clients ({clients.length})
          </h3>
        </div>

        {clients.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No clients yet. Add one using the form above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => router.push(`/coach/clients/${client.id}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Tasks
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Add clients to your program</li>
          <li>→ Create tasks for your clients</li>
          <li>→ Track their progress</li>
        </ul>
      </div>
    </div>
  );
}
