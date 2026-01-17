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

-- Restore secure policies using app-layer token-based access control
-- These policies work with migration 006's pattern of using current_setting() for tokens
-- The app layer is responsible for:
--   1. Validating the access_token matches a planning_group
--   2. Setting app.current_token via session config
--   3. Setting app.current_participant_id when participant selects their name

-- SELECT policies: Require valid access token
CREATE POLICY "Public can view events with valid token" ON planning_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      WHERE planning_groups.id = planning_events.group_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

CREATE POLICY "Public can view ideas with valid token" ON planning_ideas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      WHERE planning_groups.id = planning_ideas.group_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

CREATE POLICY "Public can view votes with valid token" ON planning_idea_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_ideas
      JOIN planning_groups ON planning_groups.id = planning_ideas.group_id
      WHERE planning_ideas.id = planning_idea_votes.idea_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- INSERT policies: Require valid access token and proper session context
CREATE POLICY "Public can create events with valid token" ON planning_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_groups
      WHERE planning_groups.id = planning_events.group_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

CREATE POLICY "Public can create ideas with valid token" ON planning_ideas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_groups
      WHERE planning_groups.id = planning_ideas.group_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

CREATE POLICY "Public can vote with valid token" ON planning_idea_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_ideas
      JOIN planning_groups ON planning_groups.id = planning_ideas.group_id
      WHERE planning_ideas.id = planning_idea_votes.idea_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- UPDATE policies: Only allow ownership-based updates (creator/participant)
CREATE POLICY "Participants can update own ideas" ON planning_ideas
  FOR UPDATE USING (
    planning_ideas.participant_id = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );

CREATE POLICY "Event creators can update events" ON planning_events
  FOR UPDATE USING (
    planning_events.created_by = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );

-- DELETE policies: Only allow ownership-based deletion (creator/participant)
CREATE POLICY "Participants can delete own ideas" ON planning_ideas
  FOR DELETE USING (
    planning_ideas.participant_id = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );

CREATE POLICY "Event creators can delete events" ON planning_events
  FOR DELETE USING (
    planning_events.created_by = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );
