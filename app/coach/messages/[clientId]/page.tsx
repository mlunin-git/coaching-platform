"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { sendMessage } from "@/lib/messaging";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import type { Database } from "@/lib/database.types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

interface ClientInfo {
  client: Client;
  user: User;
}

export default function CoachMessagesPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loadingClient, setLoadingClient] = useState(true);

  const { messages, loading } = useRealtimeMessages(clientId, "coach");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load client info
  useEffect(() => {
    const loadClientInfo = async () => {
      try {
        const supabase = getSupabaseClient();

        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .single();

        if (clientError || !clientData) throw new Error("Client not found");

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", (clientData as Client).user_id)
          .single();

        if (userError || !userData) throw new Error("User not found");

        setClientInfo({
          client: clientData as Client,
          user: userData as User,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client info");
      } finally {
        setLoadingClient(false);
      }
    };

    loadClientInfo();
  }, [clientId]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError("");

    try {
      await sendMessage(clientId, newMessage.trim(), "coach");
      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loadingClient || loading || !clientInfo) {
    return (
      <div className="space-y-4">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="list" count={3} />
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <button
          onClick={() => router.push(`/coach/clients/${clientId}`)}
          className="text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          ← Back to Client Details
        </button>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold text-gray-900">
            Messages with {clientInfo.user.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {clientInfo.user.has_auth_access
              ? clientInfo.user.email
              : `Client ID: ${clientInfo.user.client_identifier} (View-only)`}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isCoach = message.sender_type === "coach";
              return (
                <div
                  key={message.id}
                  className={`flex ${isCoach ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      isCoach
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        isCoach ? "text-blue-100" : "text-gray-500"
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
          {!clientInfo.user.has_auth_access && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              Note: This client cannot respond (no login access). You can leave messages they might see later.
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value.slice(0, 5000))}
                placeholder="Type your message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={2}
                disabled={sending}
                maxLength={5000}
              />
              <div className="mt-1 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {newMessage.length}/5000 characters
                </span>
                {newMessage.length > 4500 && (
                  <span className="text-xs text-orange-600 font-medium">
                    Approaching limit
                  </span>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium self-end h-fit"
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
