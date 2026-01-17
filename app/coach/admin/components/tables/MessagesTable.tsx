"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export function MessagesTable() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setMessages(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading messages...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (messages.length === 0) {
    return <div className="p-6 text-center text-gray-500">No messages found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">From</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">To</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Content</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(message.id as string).substring(0, 8)}...
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(message.sender_id as string)?.substring(0, 8)}...
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {(message.receiver_id as string)?.substring(0, 8)}...
              </td>
              <td className="px-4 py-2 truncate max-w-xs">{message.content}</td>
              <td className="px-4 py-2 text-gray-600">
                {message.created_at
                  ? new Date(message.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
