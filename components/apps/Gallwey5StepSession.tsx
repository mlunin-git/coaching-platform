"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SessionStep {
  id: string;
  title: string;
  description: string;
  value: string;
}

export function Gallwey5StepSession() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [session, setSession] = useState<Record<string, string>>({});

  const steps: SessionStep[] = [
    {
      id: "goal",
      title: t("apps.gallwey.goal") || "Goal",
      description: "What do you want to achieve?",
      value: "",
    },
    {
      id: "ecology",
      title: t("apps.gallwey.ecology") || "Ecology",
      description: "How will this affect different areas of your life?",
      value: "",
    },
    {
      id: "current",
      title: t("apps.gallwey.current") || "Current Situation",
      description: "What is the current state? What's working? What's not?",
      value: "",
    },
    {
      id: "transformation",
      title: t("apps.gallwey.transformation") || "Transformation",
      description: "What needs to change? What's the way forward?",
      value: "",
    },
    {
      id: "integration",
      title: t("apps.gallwey.integration") || "Integration",
      description: "What's your first action? When will you take it?",
      value: "",
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Step indicator with circle design */}
      <div className="flex items-center gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            <button
              onClick={() => setCurrentStep(index)}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${
                index === currentStep
                  ? "bg-blue-600 text-white"
                  : index < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {index === currentStep && "●"}
              {index < currentStep && "✓"}
              {index > currentStep && index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 transition-colors ${
                  index < currentStep ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {currentStep + 1}. {currentStepData.title}
          </h3>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        <textarea
          value={session[currentStepData.id] || ""}
          onChange={(e) => setSession({ ...session, [currentStepData.id]: e.target.value })}
          placeholder="Write your thoughts..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← {t("common.back")}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("common.next") || "Next"} →
          </button>
        </div>
      </div>

      {/* Session summary */}
      {currentStep === steps.length - 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">📋 Session Summary</h4>
          <div className="space-y-3 text-sm text-blue-800">
            {steps.map((step) => (
              session[step.id] && (
                <div key={step.id} className="pb-2 border-b border-blue-200 last:border-0">
                  <strong>{step.title}:</strong>
                  <p className="mt-1">{session[step.id]}</p>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
