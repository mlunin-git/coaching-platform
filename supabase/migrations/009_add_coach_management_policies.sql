-- Add missing RLS policies for coach management of planning groups

-- ============================================================
-- Coaches can manage ideas in their groups (UPDATE/DELETE)
-- ============================================================

-- Coaches can update ideas in their groups
CREATE POLICY "Coaches can update ideas in their groups" ON planning_ideas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_ideas.group_id
      AND users.auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_ideas.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can delete ideas in their groups
CREATE POLICY "Coaches can delete ideas in their groups" ON planning_ideas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_ideas.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- Coaches can manage events in their groups (UPDATE/DELETE)
-- ============================================================

-- Coaches can update events in their groups
CREATE POLICY "Coaches can update events in their groups" ON planning_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_events.group_id
      AND users.auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_events.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can delete events in their groups
CREATE POLICY "Coaches can delete events in their groups" ON planning_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_events.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- Fix: Coaches can update participants with proper WITH CHECK
-- ============================================================

-- This replaces the incomplete policy from migration 006
-- Ensuring WITH CHECK is present for security
CREATE POLICY "Coaches can update participants with check" ON planning_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_participants.group_id
      AND users.auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_participants.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- Coaches can view and manage votes in their groups
-- ============================================================

-- Coaches can delete votes in their groups (for moderation)
CREATE POLICY "Coaches can delete votes in their groups" ON planning_idea_votes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM planning_ideas
      JOIN planning_groups ON planning_groups.id = planning_ideas.group_id
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_ideas.id = planning_idea_votes.idea_id
      AND users.auth_user_id = auth.uid()
    )
  );
