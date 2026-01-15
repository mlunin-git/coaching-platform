"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getUserByAuthId } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signIn(email, password);

      // Get user profile by auth_user_id to check role
      const profile = await getUserByAuthId(data.user.id);

      if (profile.role === "coach") {
        router.push("/coach/clients");
      } else {
        router.push("/client/tasks");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter your credentials to access your dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="text-center text-sm space-y-3">
        <p className="text-gray-600">
          Are you a coach?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Create a coach account here
          </Link>
        </p>
        <p className="text-gray-600 text-xs">
          If you&apos;re a client and don&apos;t have a login, ask your coach to create an account for you.
        </p>
      </div>
    </div>
  );
}
