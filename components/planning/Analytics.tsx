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

  // Get unique cities from ALL events (not filtered by year, include active and archived)
  const cities = Array.from(
    new Map(
      events
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
    const cityEvents = events.filter(
      (e) => e.city === value.city && e.country === value.country
    );
    return {
      ...value,
      count: cityEvents.length,
    };
  });

  // Get active participants
  const activeParticipants = events.map((e) => e.creator).filter((c) => c !== undefined);

  return (
    <div className="space-y-6">
      {/* Cities Map */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          🗺️ {t("planning.analytics.citiesMap")}
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <CitiesMap cities={cities} />
        </div>
      </div>

      {/* Events per Year Chart */}
      <div>
        <div className="bg-gray-50 rounded-lg p-4">
          <YearlyChart events={events} year={currentYear} />
        </div>
      </div>
    </div>
  );
}
