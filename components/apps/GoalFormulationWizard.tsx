"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Step {
  id: string;
  label: string;
  question: string;
}

export function GoalFormulationWizard() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [goal, setGoal] = useState<Record<string, string>>({});

  const steps: Step[] = [
    {
      id: "intention",
      label: t("apps.goalWizard.intention") || "Intention",
      question: t("apps.goalWizard.intentionQuestion") || "What is your core intention? What do you truly want to achieve?"
    },
    {
      id: "targetImage",
      label: t("apps.goalWizard.targetImage") || "Target Image",
      question: t("apps.goalWizard.targetImageQuestion") || "Paint a vivid picture: What will you see, hear, and feel when you achieve this goal? Describe it in detail."
    },
    {
      id: "alignment",
      label: t("apps.goalWizard.alignment") || "Alignment with Values",
      question: t("apps.goalWizard.alignmentQuestion") || "Which of your core values does this goal align with? How does it serve your larger life purpose?"
    },
    {
      id: "somatic",
      label: t("apps.goalWizard.somatic") || "Somatic Resonance",
      question: t("apps.goalWizard.somaticQuestion") || "When you think about this goal, what do you feel in your body? Where do you feel excitement or resistance?"
    },
    {
      id: "grounding",
      label: t("apps.goalWizard.grounding") || "Grounding",
      question: t("apps.goalWizard.groundingQuestion") || "How is this goal connected to your physical reality? What specific evidence will confirm you've achieved it?"
    },
    {
      id: "date",
      label: t("apps.goalWizard.date") || "Target Date",
      question: t("apps.goalWizard.dateQuestion") || "When do you want to achieve this goal? Be specific about your timeline and any milestones."
    },
    {
      id: "formulation",
      label: t("apps.goalWizard.formulation") || "Positive Formulation",
      question: t("apps.goalWizard.formulationQuestion") || "Rewrite your goal in positive language. What are you moving TOWARD, not away FROM?"
    },
    {
      id: "firstStep",
      label: t("apps.goalWizard.firstStep") || "First Step",
      question: t("apps.goalWizard.firstStepQuestion") || "What is the very first action you will take? When and where will you take it?"
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex gap-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
              index === currentStep
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                : index < currentStep
                ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {currentStep + 1}. {currentStepData.label}
        </h3>
        <p className="text-gray-600 mb-4 italic">{currentStepData.question}</p>
        <textarea
          value={goal[currentStepData.id] || ""}
          onChange={(e) => setGoal({ ...goal, [currentStepData.id]: e.target.value })}
          placeholder="Write your thoughts..."
          className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-medium"
          >
            ← {t("common.back")}
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
          >
            {t("common.next") || "Next"} →
          </button>
        </div>
      </div>

      {/* Summary */}
      {currentStep === steps.length - 1 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-md p-6">
          <h4 className="font-semibold text-green-900 mb-3">{t("apps.goalWizard.summary")}</h4>
          <div className="space-y-3 text-sm text-green-800">
            {steps.map((step) => (
              goal[step.id] && (
                <div key={step.id}>
                  <strong>{step.label}:</strong> {goal[step.id]}
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
