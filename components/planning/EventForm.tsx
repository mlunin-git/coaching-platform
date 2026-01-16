"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";

interface EventFormProps {
  groupId: string;
  participantId: string;
  initialEvent?: {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    location?: string;
    city?: string;
    country?: string;
  };
  ideaData?: {
    title: string;
    description?: string;
    location?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventForm({
  groupId,
  participantId,
  initialEvent,
  ideaData,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialEvent?.title || ideaData?.title || "");
  const [description, setDescription] = useState(
    initialEvent?.description || ideaData?.description || ""
  );
  const [startDate, setStartDate] = useState(
    initialEvent?.start_date || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(initialEvent?.end_date || "");
  const [location, setLocation] = useState(
    initialEvent?.location || ideaData?.location || ""
  );
  const [city, setCity] = useState(initialEvent?.city || "");
  const [country, setCountry] = useState(initialEvent?.country || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!initialEvent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(t("planning.validation.titleRequired"));
      return;
    }

    if (!startDate) {
      setError("Start date is required");
      return;
    }

    if (endDate && endDate < startDate) {
      setError("End date must be after start date");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      if (isEditing) {
        // Update existing event
        const { error: updateError } = await supabase
          .from("planning_events")
          .update({
            title,
            description,
            start_date: startDate,
            end_date: endDate || null,
            location,
            city,
            country,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialEvent.id);

        if (updateError) {
          setError(updateError.message || t("planning.error.unknown"));
          setLoading(false);
          return;
        }
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from("planning_events")
          .insert({
            group_id: groupId,
            created_by: participantId,
            title,
            description,
            start_date: startDate,
            end_date: endDate || null,
            location,
            city,
            country,
          });

        if (insertError) {
          setError(insertError.message || t("planning.error.unknown"));
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      onSuccess();
    } catch (err) {
      setError(t("planning.error.unknown"));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-emerald-50 rounded-lg border border-emerald-200 p-6 space-y-4 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("planning.ideas.title")} *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("planning.ideas.description")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event description..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("planning.events.startDate")} *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("planning.events.endDate")}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("planning.ideas.location")}
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location or address"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* City & Country */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("planning.events.city")}
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("planning.events.country")}
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium disabled:opacity-50"
        >
          {loading
            ? t("common.creating")
            : isEditing
              ? t("common.save")
              : t("planning.events.createEvent")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all font-medium"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
