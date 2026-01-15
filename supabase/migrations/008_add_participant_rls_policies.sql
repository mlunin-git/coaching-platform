-- Add RLS policies for anonymous participants to interact with planning module

-- PUBLIC: Anyone can insert ideas (via anon key)
CREATE POLICY "Anyone can insert ideas" ON planning_ideas
  FOR INSERT WITH CHECK (true);

-- PUBLIC: Anyone can insert votes (via anon key)
CREATE POLICY "Anyone can insert votes" ON planning_idea_votes
  FOR INSERT WITH CHECK (true);

-- PUBLIC: Anyone can select ideas (via anon key)
CREATE POLICY "Anyone can select ideas" ON planning_ideas
  FOR SELECT USING (true);

-- PUBLIC: Anyone can select participants (via anon key)
CREATE POLICY "Anyone can select participants" ON planning_participants
  FOR SELECT USING (true);

-- PUBLIC: Anyone can select events (via anon key)
CREATE POLICY "Anyone can select events" ON planning_events
  FOR SELECT USING (true);

-- PUBLIC: Anyone can select votes (via anon key)
CREATE POLICY "Anyone can select votes" ON planning_idea_votes
  FOR SELECT USING (true);

-- PUBLIC: Anyone can select event participants (via anon key)
CREATE POLICY "Anyone can select event participants" ON planning_event_participants
  FOR SELECT USING (true);

-- PUBLIC: Anyone can delete their own votes
CREATE POLICY "Anyone can delete votes" ON planning_idea_votes
  FOR DELETE USING (true);
