import { getSupabaseClient } from "@/lib/supabase";

/**
 * Generate a cryptographically secure access token for sharing planning groups
 * Returns a 12-character URL-safe token
 */
export function generateAccessToken(): string {
  // Generate random bytes and convert to URL-safe base64
  const bytes = new Uint8Array(16); // 16 bytes = 96+ bits entropy (~21 chars in base64)
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

  if (error) throw error;
  if (!data) throw new Error("Group not found");

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

  if (error) throw error;
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
      promoted_event:planning_events(id, title),
      planning_idea_votes(id)
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Count votes in JavaScript instead of making N queries
  interface IdeaWithVotes {
    id: string;
    planning_idea_votes?: Array<{ id: string }>;
    [key: string]: unknown;
  }

  return (ideas || []).map((idea: IdeaWithVotes) => ({
    ...idea,
    vote_count: (idea.planning_idea_votes || []).length
  }));
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

  if (error) throw error;
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
      creator:planning_participants(name, color),
      planning_event_participants(id)
    `)
    .eq("group_id", groupId)
    .order("start_date", { ascending: true });

  if (error) throw error;

  // Count attendees in JavaScript instead of making N queries
  interface EventWithParticipants {
    planning_event_participants?: Array<{ id: string }>;
    [key: string]: unknown;
  }

  return (events || []).map((event: EventWithParticipants) => ({
    ...event,
    attendee_count: (event.planning_event_participants || []).length
  }));
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

  if (error) throw error;
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

  if (error) throw error;
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

  if (error) throw error;
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
