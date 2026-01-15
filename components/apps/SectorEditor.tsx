"use client";

import { useState } from "react";

interface Sector {
  id: string;
  name: string;
  level: number;
}

interface SectorEditorProps {
  sector?: Sector;
  onSave: (name: string, level: number) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function SectorEditor({ sector, onSave, onCancel, isEditing = false }: SectorEditorProps) {
  const [name, setName] = useState(sector?.name || "");
  const [level, setLevel] = useState(sector?.level || 5);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Sector name is required");
      return;
    }

    if (level < 0 || level > 10) {
      setError("Level must be between 0 and 10");
      return;
    }

    onSave(name.trim(), level);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="sector-name" className="block text-sm font-medium text-gray-700 mb-1">
          Sector Name
        </label>
        <input
          id="sector-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Health, Career, Family"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label htmlFor="sector-level" className="block text-sm font-medium text-gray-700 mb-2">
          Satisfaction Level: <span className="text-blue-600 font-bold">{level}/10</span>
        </label>
        <input
          id="sector-level"
          type="range"
          min="0"
          max="10"
          value={level}
          onChange={(e) => setLevel(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 - Not satisfied</span>
          <span>10 - Very satisfied</span>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {isEditing ? "Update Sector" : "Add Sector"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
