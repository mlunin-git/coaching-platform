"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Belief {
  id: string;
  belief: string;
  origin: string;
  impact: string;
  evidence: string;
  counter: string;
}

export function LimitingBeliefsIdentifier() {
  const { t } = useLanguage();
  const [beliefs, setBeliefs] = useState<Belief[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Belief>({
    id: "",
    belief: "",
    origin: "",
    impact: "",
    evidence: "",
    counter: "",
  });

  const addBelief = () => {
    if (!form.belief.trim()) return;

    if (editingId) {
      setBeliefs(beliefs.map((b) => (b.id === editingId ? form : b)));
      setEditingId(null);
    } else {
      setBeliefs([
        ...beliefs,
        {
          ...form,
          id: Date.now().toString(),
        },
      ]);
    }

    setForm({
      id: "",
      belief: "",
      origin: "",
      impact: "",
      evidence: "",
      counter: "",
    });
  };

  const editBelief = (belief: Belief) => {
    setForm(belief);
    setEditingId(belief.id);
  };

  const deleteBelief = (id: string) => {
    setBeliefs(beliefs.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? "Edit Belief" : "Add Limiting Belief"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What limiting belief have you discovered?
            </label>
            <p className="text-xs text-gray-500 mb-2">e.g., &quot;I&apos;m not good enough&quot;, &quot;People don&apos;t like me&quot;, etc.</p>
            <input
              type="text"
              value={form.belief}
              onChange={(e) => setForm({ ...form, belief: e.target.value })}
              placeholder="State the limiting belief..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Where does it come from?
            </label>
            <p className="text-xs text-gray-500 mb-2">Family influence, school experience, past failure, etc.</p>
            <input
              type="text"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              placeholder="Describe the origin..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How does it limit you?
            </label>
            <p className="text-xs text-gray-500 mb-2">What opportunities does it prevent? How does it hold you back?</p>
            <textarea
              value={form.impact}
              onChange={(e) => setForm({ ...form, impact: e.target.value })}
              placeholder="Describe the impact on your life..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What evidence contradicts this belief?
            </label>
            <p className="text-xs text-gray-500 mb-2">Times you proved this belief wrong, counter-examples, achievements</p>
            <textarea
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
              placeholder="List evidence that contradicts this belief..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What&apos;s a more empowering belief instead?
            </label>
            <p className="text-xs text-gray-500 mb-2">Create a positive counter-belief that&apos;s also realistic</p>
            <textarea
              value={form.counter}
              onChange={(e) => setForm({ ...form, counter: e.target.value })}
              placeholder="State the empowering alternative..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
            />
          </div>

          <button
            onClick={addBelief}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {editingId ? "Update Belief" : "Add Belief"}
          </button>
        </div>
      </div>

      {/* Beliefs List */}
      <div className="space-y-4">
        {beliefs.map((belief) => (
          <div key={belief.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-semibold text-gray-900">&quot;{belief.belief}&quot;</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => editBelief(belief)}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteBelief(belief.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {belief.origin && (
                <p>
                  <strong className="text-gray-700">Origin:</strong> {belief.origin}
                </p>
              )}
              {belief.impact && (
                <p>
                  <strong className="text-gray-700">Impact:</strong> {belief.impact}
                </p>
              )}
              {belief.evidence && (
                <div className="bg-green-50 p-3 rounded">
                  <strong className="text-green-700">Evidence Against:</strong>
                  <p className="text-green-600">{belief.evidence}</p>
                </div>
              )}
              {belief.counter && (
                <div className="bg-blue-50 p-3 rounded">
                  <strong className="text-blue-700">Counter-Belief:</strong>
                  <p className="text-blue-600">{belief.counter}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {beliefs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No beliefs documented yet. Start by adding your first limiting belief.</p>
        </div>
      )}
    </div>
  );
}
