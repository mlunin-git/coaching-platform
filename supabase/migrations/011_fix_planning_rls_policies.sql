-- Fix RLS policies after partial migration 010 execution
-- This ensures all policies are properly set up for deletion and updates

-- Drop all policies to start fresh
DROP POLICY IF EXISTS "Public can create events" ON planning_events;
DROP POLICY IF EXISTS "Public can create ideas" ON planning_ideas;
DROP POLICY IF EXISTS "Public can create votes" ON planning_idea_votes;
DROP POLICY IF EXISTS "Public can delete ideas" ON planning_ideas;
DROP POLICY IF EXISTS "Public can delete events" ON planning_events;
DROP POLICY IF EXISTS "Public can update ideas" ON planning_ideas;
DROP POLICY IF EXISTS "Public can update events" ON planning_events;

-- Also drop any old policies that might exist
DROP POLICY IF EXISTS "Public can create events with valid token" ON planning_events;
DROP POLICY IF EXISTS "Public can create ideas with valid token" ON planning_ideas;
DROP POLICY IF EXISTS "Anyone can insert ideas" ON planning_ideas;
DROP POLICY IF EXISTS "Anyone can insert votes" ON planning_idea_votes;
DROP POLICY IF EXISTS "Participants can delete their own ideas" ON planning_ideas;
DROP POLICY IF EXISTS "Event creators can delete events" ON planning_events;
DROP POLICY IF EXISTS "Participants can update own ideas" ON planning_ideas;
DROP POLICY IF EXISTS "Event creators can update events" ON planning_events;

-- Recreate all policies cleanly
CREATE POLICY "Public can create events" ON planning_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create ideas" ON planning_ideas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create votes" ON planning_idea_votes
  FOR INSERT WITH CHECK (true);

-- Allow deletion (app layer validates ownership)
CREATE POLICY "Public can delete ideas" ON planning_ideas
  FOR DELETE USING (true);

CREATE POLICY "Public can delete events" ON planning_events
  FOR DELETE USING (true);

-- Allow updates for ideas and events (app layer validates ownership)
CREATE POLICY "Public can update ideas" ON planning_ideas
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public can update events" ON planning_events
  FOR UPDATE USING (true) WITH CHECK (true);
