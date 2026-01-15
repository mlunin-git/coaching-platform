"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { sendMessage } from "@/lib/messaging";
import type { Database } from "@/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];
type UserProfile = Database["public"]["Tables"]["users"]["Row"];
type ClientRecord = Database["public"]["Tables"]["clients"]["Row"];

export default function ClientMessagesPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [clientId, setClientId] = useState<string | null>(null);
  const [coachInfo, setCoachInfo] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const { messages, loading } = useRealtimeMessages(clientId || "", "client");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load client record and coach info
  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (profileError || !userProfile) throw new Error("User profile not found");

        const profile = userProfile as UserProfile;

        // Get client record
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id, coach_id")
          .eq("user_id", profile.id)
          .single();

        if (clientError || !clientData) throw new Error("Client record not found");

        const client = clientData as ClientRecord;
        setClientId(client.id);

        // Get coach info
        const { data: coachData, error: coachError } = await supabase
          .from("users")
          .select("*")
          .eq("id", client.coach_id)
          .single();

        if (coachError || !coachData) throw new Error("Coach not found");

        setCoachInfo(coachData as User);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [router]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !clientId) return;

    setSending(true);
    setError("");

    try {
      await sendMessage(clientId, newMessage.trim(), "client");
      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loadingData || loading || !coachInfo || !clientId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold text-gray-900">
            Messages with {coachInfo.name} (Your Coach)
          </h2>
          <p className="text-sm text-gray-600 mt-1">{coachInfo.email}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Send your coach a message!
            </div>
          ) : (
            messages.map((message) => {
              const isClient = message.sender_type === "client";
              return (
                <div
                  key={message.id}
                  className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      isClient
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        isClient ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={2}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium self-end"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
