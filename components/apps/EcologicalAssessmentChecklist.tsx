"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Area {
  id: string;
  name: string;
  questions: {
    id: string;
    text: string;
    answer: string;
  }[];
}

export function EcologicalAssessmentChecklist() {
  const { t } = useLanguage();
  const [areas, setAreas] = useState<Area[]>([
    {
      id: "health",
      name: "Health & Wellness",
      questions: [
        { id: "h1", text: "How will this goal affect your physical health?", answer: "" },
        { id: "h2", text: "What changes in energy levels might occur?", answer: "" },
        { id: "h3", text: "How might this affect your sleep or rest?", answer: "" },
      ],
    },
    {
      id: "relationships",
      name: "Relationships",
      questions: [
        { id: "r1", text: "How will this goal impact your family?", answer: "" },
        { id: "r2", text: "What changes might happen in friendships?", answer: "" },
        { id: "r3", text: "How might this affect your intimate relationships?", answer: "" },
      ],
    },
    {
      id: "work",
      name: "Work & Career",
      questions: [
        { id: "w1", text: "How will this goal impact your professional life?", answer: "" },
        { id: "w2", text: "What changes in responsibilities might occur?", answer: "" },
        { id: "w3", text: "How might this affect your work-life balance?", answer: "" },
      ],
    },
    {
      id: "finance",
      name: "Finance",
      questions: [
        { id: "f1", text: "What financial implications does this goal have?", answer: "" },
        { id: "f2", text: "How might your income or expenses change?", answer: "" },
        { id: "f3", text: "What about financial security and stability?", answer: "" },
      ],
    },
    {
      id: "growth",
      name: "Personal Growth",
      questions: [
        { id: "g1", text: "How will this goal challenge you?", answer: "" },
        { id: "g2", text: "What new skills or knowledge will you need?", answer: "" },
        { id: "g3", text: "How might this goal change your self-image?", answer: "" },
      ],
    },
  ]);

  const updateAnswer = (areaId: string, questionId: string, answer: string) => {
    setAreas(
      areas.map((area) =>
        area.id === areaId
          ? {
              ...area,
              questions: area.questions.map((q) =>
                q.id === questionId ? { ...q, answer } : q
              ),
            }
          : area
      )
    );
  };

  const completionPercentage = Math.round(
    (areas.reduce((sum, area) => sum + area.questions.filter((q) => q.answer).length, 0) /
      areas.reduce((sum, area) => sum + area.questions.length, 0)) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900">Assessment Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Areas */}
      <div className="space-y-6">
        {areas.map((area) => (
          <div key={area.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{area.name}</h3>
            <div className="space-y-4">
              {area.questions.map((question) => (
                <div key={question.id} className="pb-4 border-b border-gray-200 last:border-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {question.text}
                  </label>
                  <textarea
                    value={question.answer}
                    onChange={(e) =>
                      updateAnswer(area.id, question.id, e.target.value)
                    }
                    placeholder="Your thoughts..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {completionPercentage === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-900 mb-2">✓ Assessment Complete!</h4>
          <p className="text-sm text-green-800">
            You&apos;ve thoroughly considered the ecological impact of your goal across all life areas.
          </p>
        </div>
      )}
    </div>
  );
}
