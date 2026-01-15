import { getSupabaseClient } from "@/lib/supabase";

/**
 * Generate a cryptographically secure access token for sharing planning groups
 * Returns a 12-character URL-safe token
 */
export function generateAccessToken(): string {
  // Generate random bytes and convert to URL-safe base64
  const bytes = new Uint8Array(9); // 9 bytes = 12 chars in base64
  crypto.getRandomValues(bytes);
  const token = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
    .slice(0, 12);
  return token;
}

/**
 * Validate that an access token exists and belongs to a group
 */
export async function validateAccessToken(token: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("planning_groups")
    .select("id")
    .eq("access_token", token)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Get a planning group by access token
 */
export async function getGroupByToken(token: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("planning_groups")
    .select("*")
    .eq("access_token", token)
    .single();

  if (error) {
    console.error("Error fetching group:", error);
    return null;
  }

  return data;
}

/**
 * Get all participants for a group
 */
export async function getGroupParticipants(groupId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("planning_participants")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching participants:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all ideas for a group with vote counts
 */
export async function getGroupIdeas(groupId: string) {
  const supabase = getSupabaseClient();

  const { data: ideas, error } = await supabase
    .from("planning_ideas")
    .select(`
      *,
      participant:planning_participants(name, color),
      promoted_event:planning_events(id, title)
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ideas:", error);
    return [];
  }

  // Get vote counts for each idea
  if (ideas) {
    for (const idea of ideas) {
      const { count } = await supabase
        .from("planning_idea_votes")
        .select("id", { count: "exact" })
        .eq("idea_id", idea.id);

      idea.vote_count = count || 0;
    }
  }

  return ideas || [];
}

/**
 * Get vote count for an idea
 */
export async function getIdeaVoteCount(ideaId: string): Promise<number> {
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from("planning_idea_votes")
    .select("id", { count: "exact" })
    .eq("idea_id", ideaId);

  if (error) {
    console.error("Error fetching vote count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Check if a participant has voted on an idea
 */
export async function hasParticipantVoted(
  ideaId: string,
  participantId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("planning_idea_votes")
    .select("id")
    .eq("idea_id", ideaId)
    .eq("participant_id", participantId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

/**
 * Get all events for a group with attendee counts
 */
export async function getGroupEvents(groupId: string) {
  const supabase = getSupabaseClient();

  const { data: events, error } = await supabase
    .from("planning_events")
    .select(`
      *,
      creator:planning_participants(name, color)
    `)
    .eq("group_id", groupId)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  // Get attendee counts for each event
  if (events) {
    for (const event of events) {
      const { count } = await supabase
        .from("planning_event_participants")
        .select("id", { count: "exact" })
        .eq("event_id", event.id);

      event.attendee_count = count || 0;
    }
  }

  return events || [];
}

/**
 * Get non-archived events for a group
 */
export async function getActiveGroupEvents(groupId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("planning_events")
    .select(`
      *,
      creator:planning_participants(name, color)
    `)
    .eq("group_id", groupId)
    .eq("is_archived", false)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching active events:", error);
    return [];
  }

  return data || [];
}

/**
 * Get archived events for a group
 */
export async function getArchivedGroupEvents(groupId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("planning_events")
    .select(`
      *,
      creator:planning_participants(name, color)
    `)
    .eq("group_id", groupId)
    .eq("is_archived", true)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching archived events:", error);
    return [];
  }

  return data || [];
}

/**
 * Get attendees for an event
 */
export async function getEventAttendees(eventId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("planning_event_participants")
    .select(`
      id,
      participant:planning_participants(id, name, color)
    `)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching attendees:", error);
    return [];
  }

  return data || [];
}

/**
 * Check if a participant is attending an event
 */
export async function isParticipantAttending(
  eventId: string,
  participantId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("planning_event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("participant_id", participantId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

/**
 * Get analytics data for a group
 */
export async function getGroupAnalytics(groupId: string) {
  const supabase = getSupabaseClient();

  // Get total events
  const { count: totalEvents } = await supabase
    .from("planning_events")
    .select("id", { count: "exact" })
    .eq("group_id", groupId)
    .eq("is_archived", false);

  // Get total ideas
  const { count: totalIdeas } = await supabase
    .from("planning_ideas")
    .select("id", { count: "exact" })
    .eq("group_id", groupId)
    .is("promoted_to_event_id", null);

  // Get all events for analysis
  const { data: events } = await supabase
    .from("planning_events")
    .select("*")
    .eq("group_id", groupId);

  // Group events by month for chart
  const monthlyData: Record<number, number> = {};
  if (events) {
    events.forEach((event) => {
      const date = new Date(event.start_date);
      const month = date.getMonth() + 1; // 1-12
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
  }

  // Extract cities
  const cities = events
    ?.filter((e) => e.city && e.country)
    .map((e) => ({
      city: e.city,
      country: e.country,
      latitude: 0, // To be filled with geocoding if needed
      longitude: 0,
    })) || [];

  return {
    totalEvents: totalEvents || 0,
    totalIdeas: totalIdeas || 0,
    monthlyData,
    cities,
  };
}
