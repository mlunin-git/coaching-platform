"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { ClientsList } from "./components/ClientsList";
import { AddClientForm } from "./components/AddClientForm";
import type { Database } from "@/lib/database.types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

interface ClientWithUser extends Client {
  email?: string | null;
  client_identifier?: string | null;
  has_auth_access?: boolean;
  user?: Omit<User, "auth_user_id" | "name" | "role" | "created_at" | "updated_at"> & {
    email?: string | null;
    client_identifier?: string | null;
    has_auth_access?: boolean;
  };
}

export default function ClientsPage() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<ClientWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [useEmail, setUseEmail] = useState(true);
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    let isMounted = true;

    setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseClient();

      // Check authentication first
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        if (isMounted) {
          setError(`Authentication error: ${sessionError.message}`);
        }
        return;
      }

      if (!session?.user?.id) {
        if (isMounted) {
          setError("Not authenticated");
        }
        return;
      }

      // Get coach's user record
      const { data: coachUser, error: coachError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single()
        .timeout(5000);

      if (coachError) {
        if (isMounted) {
          setError(`Failed to load coach profile: ${coachError.message}`);
        }
        return;
      }

      if (!coachUser?.id) {
        if (isMounted) {
          setError("Coach profile not found");
        }
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
        .eq("coach_id", coachUser.id)
        .timeout(5000);

      if (clientsError) {
        if (isMounted) {
          setError(`Failed to load clients: ${clientsError.message}`);
        }
        return;
      }

      // Flatten the data structure
      const enrichedClients = (data || []).map((client: ClientWithUser) => ({
        ...client,
        email: client.user?.email,
        client_identifier: client.user?.client_identifier,
        has_auth_access: client.user?.has_auth_access,
      }));

      if (isMounted) {
        setClients(enrichedClients);
        setError("");
      }
    } catch (err) {
      if (isMounted) {
        setError(err instanceof Error ? err.message : "Failed to load clients");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    // Return cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadClients();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [loadClients]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("coach.manageClients")}
        </h2>
        <p className="text-gray-600">{t("coach.addDescription")}</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <SectionErrorBoundary section="clients list">
        <ClientsList clients={clients} isLoading={loading} />
      </SectionErrorBoundary>

      <SectionErrorBoundary section="add client form">
        <AddClientForm
          onClientAdded={loadClients}
          useEmail={useEmail}
          onClientTypeChange={setUseEmail}
        />
      </SectionErrorBoundary>

      {/* Quick Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">
          {t("coach.nextSteps")}
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li><span aria-label="completed">✓</span> {t("coach.addClientsStep")}</li>
          <li><span aria-label="next step">→</span> {t("coach.createTasksStep")}</li>
          <li><span aria-label="next step">→</span> {t("coach.trackProgressStep")}</li>
        </ul>
      </div>
    </div>
  );
}
