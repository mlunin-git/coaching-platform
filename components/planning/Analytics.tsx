"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { YearlyChart } from "./YearlyChart";
import { CitiesMap } from "./CitiesMap";

interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  city?: string;
  country?: string;
  is_archived: boolean;
  group_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator?: { name: string; color?: string };
  planning_event_participants?: Array<{ id: string }>;
  attendee_count?: number;
}

interface Idea {
  id: string;
  title: string;
  description?: string;
  location?: string;
  group_id: string;
  participant_id: string;
  promoted_to_event_id?: string;
  created_at: string;
  updated_at: string;
  participant?: { name: string; color?: string };
  promoted_event?: { id: string; title: string };
  vote_count: number;
}

interface Participant {
  id: string;
  name: string;
  color: string | null;
}

export function Analytics({
  events,
  ideas,
  participants,
}: {
  events: Event[];
  ideas: Idea[];
  participants: Participant[];
}) {
  const { t } = useLanguage();

  // Get current year
  const currentYear = new Date().getFullYear();

  // Filter events for current year only
  const currentYearEvents = events.filter((event) => {
    const eventYear = new Date(event.start_date).getFullYear();
    return eventYear === currentYear && !event.is_archived;
  });

  // Get unique cities
  const cities = Array.from(
    new Map(
      currentYearEvents
        .filter((event) => event.city && event.country)
        .map((event) => [
          `${event.city}-${event.country}`,
          {
            city: event.city,
            country: event.country,
            count: 0,
          },
        ])
    ).entries()
  ).map(([, value]) => {
    const cityEvents = currentYearEvents.filter(
      (e) => e.city === value.city && e.country === value.country
    );
    return {
      ...value,
      count: cityEvents.length,
    };
  });

  // Get active participants
  const activeParticipants = currentYearEvents.map((e) => e.creator).filter((c) => c !== undefined);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📊 {t("planning.analytics.eventsPerMonth")}
          </h2>
          <YearlyChart events={currentYearEvents} year={currentYear} />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🗺️ {t("planning.analytics.citiesMap")}
          </h2>
          <CitiesMap cities={cities} />
        </div>
      </div>

      {/* Top Locations */}
      {cities.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🏙️ Top Cities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cities
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map((city, index) => (
                <div
                  key={`${city.city}-${city.country}`}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="text-2xl font-bold text-indigo-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {city.city}, {city.country}
                    </div>
                    <div className="text-sm text-gray-600">
                      {city.count} {city.count === 1 ? "event" : "events"}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
