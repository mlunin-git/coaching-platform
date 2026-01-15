"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PlanningLandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
      <main className="container mx-auto px-4 pb-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("planning.title")}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plan activities and events throughout the year with your group.
              Share ideas, vote, and track your shared calendar.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Feature 1: Share Ideas */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Share Ideas
              </h3>
              <p className="text-gray-700">
                Submit your ideas for activities and events. Let others vote and
                show their interest.
              </p>
            </div>

            {/* Feature 2: Vote & Discuss */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="text-4xl mb-3">🗳️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Vote & Discuss
              </h3>
              <p className="text-gray-700">
                Vote on ideas you like. Ideas with the most votes become
                scheduled events.
              </p>
            </div>

            {/* Feature 3: Shared Calendar */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200">
              <div className="text-4xl mb-3">🗓️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Shared Calendar
              </h3>
              <p className="text-gray-700">
                View all planned events on a shared calendar. Never miss an
                important date.
              </p>
            </div>

            {/* Feature 4: Analytics */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Analytics
              </h3>
              <p className="text-gray-700">
                Track events per month and see which cities you'll be visiting
                most.
              </p>
            </div>
          </div>

          {/* How to Access */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔗 Get Access
            </h2>
            <p className="text-gray-700 mb-4">
              To access a planning group, you need a direct shareable link from
              your group administrator (coach).
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Steps to join:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
              <li>Contact your coach or group administrator</li>
              <li>Request the shareable link for your planning group</li>
              <li>Open the link in your browser</li>
              <li>Select your name from the dropdown</li>
              <li>Start sharing ideas and voting!</li>
            </ol>
          </div>

          {/* Link to Applications */}
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Looking for other coaching tools?
            </p>
            <Link
              href="/apps"
              className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-medium"
            >
              ← Back to Applications
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
