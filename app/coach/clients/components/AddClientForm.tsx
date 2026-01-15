"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";
import { validateClientCreation } from "@/lib/validation";
import { generateSecurePassword } from "@/lib/password-generator";

interface AddClientFormProps {
  onClientAdded: () => void;
  useEmail: boolean;
  onClientTypeChange: (useEmail: boolean) => void;
}

export function AddClientForm({
  onClientAdded,
  useEmail,
  onClientTypeChange,
}: AddClientFormProps) {
  const { t } = useLanguage();
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [generatedClientId, setGeneratedClientId] = useState("");

  async function handleAddClient(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    setGeneratedClientId("");

    // Trim inputs before validation
    const trimmedName = newClientName.trim();
    const trimmedEmail = newClientEmail.trim();

    // Validate input on client side first
    const validation = validateClientCreation(
      trimmedName,
      useEmail ? trimmedEmail : undefined
    );
    if (!validation.valid) {
      setError(validation.errors[0].message);
      setAdding(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error("Failed to get user: " + userError.message);
      }

      if (!user?.id) throw new Error("Not authenticated");

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
        // Generate cryptographically secure password (128-bit entropy)
        const securePassword = generateSecurePassword();

        const { data: authData, error: signUpError } = await supabase.auth.signUp(
          {
            email: trimmedEmail,
            password: securePassword,
          }
        );

        if (signUpError) throw signUpError;
        if (!authData.user?.id) throw new Error("Failed to create auth user");

        // Create user profile
        const { data: newUser, error: profileError } = await supabase
          .from("users")
          .insert({
            auth_user_id: authData.user.id,
            email: trimmedEmail,
            name: trimmedName,
            role: "client",
            has_auth_access: true,
            client_identifier: null,
          })
          .select()
          .single();

        if (profileError || !newUser) throw profileError || new Error("Failed to create user profile");
        newUserId = newUser.id;
      } else {
        // === CLIENT WITHOUT EMAIL (new flow) ===
        const { generateClientIdentifier } = await import(
          "@/lib/client-id-generator"
        );
        clientIdentifier = await generateClientIdentifier(coachUser.id, supabase);

        if (!clientIdentifier) {
          throw new Error("Failed to generate client identifier");
        }

        // Create user profile WITHOUT Supabase Auth
        const { data: newUser, error: profileError } = await supabase
          .from("users")
          .insert({
            auth_user_id: null,
            email: null,
            client_identifier: clientIdentifier,
            name: trimmedName,
            role: "client",
            has_auth_access: false,
          })
          .select()
          .single();

        if (profileError || !newUser) throw profileError || new Error("Failed to create user profile");
        newUserId = newUser.id;
        setGeneratedClientId(clientIdentifier);
      }

      // Create client record
      const { error: clientError } = await supabase
        .from("clients")
        .insert({
          coach_id: coachUser.id,
          user_id: newUserId,
          name: trimmedName,
        });

      if (clientError) throw clientError;

      setNewClientName("");
      setNewClientEmail("");
      onClientAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add client");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t("coach.addNewClient")}
      </h3>
      <form onSubmit={handleAddClient} className="space-y-4">
        {/* Client Type Toggle */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={useEmail}
              onChange={() => onClientTypeChange(true)}
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
              onChange={() => onClientTypeChange(false)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">
              {t("coach.withoutEmail")}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
            <p className="text-sm font-medium text-green-900">
              {t("coach.clientCreatedSuccess")}
            </p>
            <p className="text-sm text-green-700 mt-1">
              {t("coach.clientIdLabel")}{" "}
              <span className="font-mono font-bold">{generatedClientId}</span>
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
  );
}
