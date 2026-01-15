"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Database } from "@/lib/database.types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

interface ClientWithUser extends Client {
  email?: string | null;
  client_identifier?: string | null;
  has_auth_access?: boolean;
}

export default function ClientsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [clients, setClients] = useState<ClientWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [useEmail, setUseEmail] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [generatedClientId, setGeneratedClientId] = useState("");

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get coach's user record
      const { data: coachUser, error: coachError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (coachError || !coachUser) {
        setError("Coach profile not found");
        return;
      }

      // Join clients with users to get email/identifier info
      const { data, error: clientsError } = await supabase
        .from("clients")
        .select(
          `
          *,
          user:user_id (
            email,
            client_identifier,
            has_auth_access
          )
        `
        )
        .eq("coach_id", coachUser.id);

      if (clientsError) throw clientsError;

      // Flatten the data structure
      const enrichedClients = (data || []).map((client: any) => ({
        ...client,
        email: client.user?.email,
        client_identifier: client.user?.client_identifier,
        has_auth_access: client.user?.has_auth_access,
      }));

      setClients(enrichedClients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    setGeneratedClientId("");

    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Get coach's user record
      const { data: coachUser, error: coachError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (coachError || !coachUser) throw new Error("Coach not found");

      let newUserId: string;
      let clientIdentifier: string | null = null;

      if (useEmail) {
        // === CLIENT WITH EMAIL (existing flow) ===
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: newClientEmail,
          password: Math.random().toString(36).slice(-12), // Random password
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Failed to create auth user");

        // Create user profile
        const { data: newUser, error: profileError } = await (supabase as any)
          .from("users")
          .insert({
            auth_user_id: authData.user.id,
            email: newClientEmail,
            name: newClientName,
            role: "client",
            has_auth_access: true,
            client_identifier: null,
          } as any)
          .select()
          .single();

        if (profileError) throw profileError;
        newUserId = newUser.id;
      } else {
        // === CLIENT WITHOUT EMAIL (new flow) ===
        const { generateClientIdentifier } = await import("@/lib/client-id-generator");
        clientIdentifier = await generateClientIdentifier(coachUser.id, supabase);

        // Create user profile WITHOUT Supabase Auth
        const { data: newUser, error: profileError } = await (supabase as any)
          .from("users")
          .insert({
            auth_user_id: null,
            email: null,
            client_identifier: clientIdentifier,
            name: newClientName,
            role: "client",
            has_auth_access: false,
          } as any)
          .select()
          .single();

        if (profileError) throw profileError;
        newUserId = newUser.id;
        setGeneratedClientId(clientIdentifier);
      }

      // Create client record
      const { error: clientError } = await (supabase as any)
        .from("clients")
        .insert({
          coach_id: coachUser.id,
          user_id: newUserId,
          name: newClientName,
        } as any);

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("coach.manageClients")}</h2>
        <p className="text-gray-600">{t("coach.addDescription")}</p>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("coach.clientsList")} ({clients.length})
          </h3>
        </div>

        {clients.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {t("coach.noClientsYet")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t("coach.name")}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    {t("coach.identifier")}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    {t("coach.loginAccess")}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    {t("coach.added")}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    {t("coach.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="font-mono text-xs">
                        {client.email || client.client_identifier || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {client.has_auth_access ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t("coach.canLogin")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {t("coach.viewOnly")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => router.push(`/coach/clients/${client.id}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {t("coach.viewTasks")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Client Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("coach.addNewClient")}</h3>
        <form onSubmit={handleAddClient} className="space-y-4">
          {/* Client Type Toggle */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useEmail}
                onChange={() => setUseEmail(true)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                {t("coach.withEmail")}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useEmail}
                onChange={() => setUseEmail(false)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                {t("coach.withoutEmail")}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t("coach.clientName")}
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

            {/* Only show email field when useEmail is true */}
            {useEmail && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("coach.clientEmail")}
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
            )}
          </div>

          {/* Show generated client ID after creation */}
          {generatedClientId && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900">{t("coach.clientCreatedSuccess")}</p>
              <p className="text-sm text-green-700 mt-1">
                {t("coach.clientIdLabel")} <span className="font-mono font-bold">{generatedClientId}</span>
              </p>
              <p className="text-xs text-green-600 mt-2">
                {t("coach.clientNoLogin")}
              </p>
            </div>
          )}

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
            {adding ? t("common.creating") : t("coach.createClient")}
          </button>
        </form>
      </div>

      {/* Quick Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">{t("coach.nextSteps")}</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ {t("coach.addClientsStep")}</li>
          <li>→ {t("coach.createTasksStep")}</li>
          <li>→ {t("coach.trackProgressStep")}</li>
        </ul>
      </div>
    </div>
  );
}
