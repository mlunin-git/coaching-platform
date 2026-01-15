-- Fix RLS policies: Add missing SELECT policies for coaches

-- Coaches can view participants in their groups (was missing!)
CREATE POLICY "Coaches can view participants in their groups" ON planning_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_participants.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can view ideas in their groups (was missing!)
CREATE POLICY "Coaches can view ideas in their groups" ON planning_ideas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_ideas.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can view events in their groups (was missing!)
CREATE POLICY "Coaches can view events in their groups" ON planning_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_events.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can view votes on ideas in their groups (was missing!)
CREATE POLICY "Coaches can view votes in their groups" ON planning_idea_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_ideas
      JOIN planning_groups ON planning_groups.id = planning_ideas.group_id
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_ideas.id = planning_idea_votes.idea_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can view event participants in their groups (was missing!)
CREATE POLICY "Coaches can view event participants in their groups" ON planning_event_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_events
      JOIN planning_groups ON planning_groups.id = planning_events.group_id
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_events.id = planning_event_participants.event_id
      AND users.auth_user_id = auth.uid()
    )
  );
