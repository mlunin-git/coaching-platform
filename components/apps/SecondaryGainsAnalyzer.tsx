"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Item {
  id: string;
  text: string;
  x: number; // Action (0-10)
  y: number; // Gain (0-10)
}

export function SecondaryGainsAnalyzer() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        text: newItem,
        x: 5,
        y: 5,
      },
    ]);
    setNewItem("");
  };

  const updateItem = (id: string, x: number, y: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, x, y } : item)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const size = 400;
  const padding = 40;
  const chartSize = size - 2 * padding;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl shadow-md p-4">
        <p className="text-sm text-indigo-900">
          <strong>How to use:</strong> Position each consequence on the matrix:
        </p>
        <ul className="text-sm text-indigo-800 mt-2 space-y-1">
          <li>• <strong>X-axis:</strong> Left = Taking action needed | Right = Do nothing/inaction</li>
          <li>• <strong>Y-axis:</strong> Top = Gain/benefit | Bottom = Loss/risk</li>
        </ul>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Consequence</h3>
        <p className="text-sm text-gray-600 mb-3">What&apos;s a consequence of achieving (or not achieving) your goal?</p>
        <div className="flex gap-3">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addItem()}
            placeholder="e.g., 'More confidence', 'Less stress', 'Requires effort', 'Stay comfortable'..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
          />
          <button
            onClick={addItem}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Matrix visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto border border-gray-200 rounded">
          {/* Axes */}
          <line x1={padding} y1={size - padding} x2={size - padding} y2={size - padding} stroke="#999" strokeWidth="2" />
          <line x1={padding} y1={padding} x2={padding} y2={size - padding} stroke="#999" strokeWidth="2" />

          {/* Grid */}
          {[...Array(5)].map((_, i) => (
            <g key={`grid-${i}`}>
              <line x1={padding} y1={padding + (i * chartSize) / 4} x2={size - padding} y2={padding + (i * chartSize) / 4} stroke="#e5e7eb" strokeWidth="1" />
              <line x1={padding + (i * chartSize) / 4} y1={padding} x2={padding + (i * chartSize) / 4} y2={size - padding} stroke="#e5e7eb" strokeWidth="1" />
            </g>
          ))}

          {/* Labels */}
          <text x={padding - 5} y={padding - 10} textAnchor="end" fontSize="12" fill="#666">
            Gain
          </text>
          <text x={size - padding + 10} y={size - padding + 15} fontSize="12" fill="#666">
            Action
          </text>

          {/* Items */}
          {items.map((item) => {
            const px = padding + (item.x / 10) * chartSize;
            const py = size - padding - (item.y / 10) * chartSize;
            return (
              <g key={item.id}>
                <circle cx={px} cy={py} r="8" fill="#3b82f6" opacity="0.7" />
                <title>{item.text}</title>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Items list with sliders */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="font-medium text-gray-900">{item.text}</p>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-600 hover:text-red-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* X slider (Action vs Inaction) */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Taking Action ({item.x}) ← → Inaction (10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={item.x}
                onChange={(e) => updateItem(item.id, parseInt(e.target.value), item.y)}
                className="w-full"
              />
            </div>

            {/* Y slider (Gain vs Loss) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Gain ({item.y}) ← → Loss (0)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={item.y}
                onChange={(e) => updateItem(item.id, item.x, parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
