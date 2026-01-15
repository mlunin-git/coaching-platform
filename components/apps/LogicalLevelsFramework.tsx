"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Level {
  id: string;
  name: string;
  description: string;
  color: string;
  currentState: string;
  desiredState: string;
}

export function LogicalLevelsFramework() {
  const { t } = useLanguage();
  const [levels, setLevels] = useState<Level[]>([
    {
      id: "environment",
      name: "Environment",
      description: "Where and when? External conditions and context",
      color: "bg-red-50 border-red-500",
      currentState: "",
      desiredState: "",
    },
    {
      id: "behavior",
      name: "Behavior",
      description: "What do you do? Specific actions and reactions",
      color: "bg-orange-50 border-orange-500",
      currentState: "",
      desiredState: "",
    },
    {
      id: "capabilities",
      name: "Capabilities",
      description: "How do you do it? Skills, knowledge, strategies",
      color: "bg-yellow-50 border-yellow-500",
      currentState: "",
      desiredState: "",
    },
    {
      id: "values",
      name: "Values & Beliefs",
      description: "Why? What's important and what do you believe?",
      color: "bg-green-50 border-green-500",
      currentState: "",
      desiredState: "",
    },
    {
      id: "identity",
      name: "Identity",
      description: "Who are you? Your sense of self",
      color: "bg-blue-50 border-blue-500",
      currentState: "",
      desiredState: "",
    },
    {
      id: "purpose",
      name: "Purpose",
      description: "What for? Your larger mission and vision",
      color: "bg-purple-50 border-purple-500",
      currentState: "",
      desiredState: "",
    },
  ]);

  const updateLevel = (id: string, field: string, value: string) => {
    setLevels(
      levels.map((level) =>
        level.id === id
          ? { ...level, [field]: value }
          : level
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          Analyze your situation at different levels of thinking. Each level influences the one below it. Start from the bottom and work your way up.
        </p>
      </div>

      {/* Levels - displayed in reverse order (top to bottom) */}
      <div className="space-y-4">
        {[...levels].reverse().map((level) => (
          <div
            key={level.id}
            className={`rounded-lg shadow p-6 border-l-4 ${level.color}`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{level.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{level.description}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current State
                </label>
                <textarea
                  value={level.currentState}
                  onChange={(e) => updateLevel(level.id, "currentState", e.target.value)}
                  placeholder="How is it now?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired State
                </label>
                <textarea
                  value={level.desiredState}
                  onChange={(e) => updateLevel(level.id, "desiredState", e.target.value)}
                  placeholder="How do you want it to be?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="space-y-3 text-sm">
          {levels.some((l) => l.currentState && l.desiredState) ? (
            <>
              <p>
                <strong>Self-Alignment:</strong> Are your behaviors and capabilities aligned
                with your identity and values?
              </p>
              <p>
                <strong>Environmental Factors:</strong> Does your current environment support
                your desired identity and purpose?
              </p>
              <p>
                <strong>Action Items:</strong> What changes are needed at each level to achieve
                your desired outcome?
              </p>
            </>
          ) : (
            <p className="text-gray-500">
              Fill in current and desired states to see insights.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
