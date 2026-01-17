"use client";

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Analytics Dashboard Coming Soon
        </h2>
        <p className="text-blue-700">
          Web tracking is active and collecting data. Analytics dashboard will display:
        </p>
        <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
          <li>Daily activity (page views and sessions)</li>
          <li>Top pages by view count</li>
          <li>Page performance metrics</li>
          <li>Session analytics</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">📊 Total Sessions</div>
          <div className="text-3xl font-bold text-blue-600">-</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">👁️ Total Page Views</div>
          <div className="text-3xl font-bold text-green-600">-</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">⏱️ Avg. Session Duration</div>
          <div className="text-3xl font-bold text-purple-600">-</div>
        </div>
      </div>
    </div>
  );
}
