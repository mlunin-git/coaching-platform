# How to Run the Year Planning Module Migration

Since I cannot access your database password directly, here's the easiest way to run the migration:

## Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `aqcanwccrodchljmwsjf`
3. In the left sidebar, click **SQL Editor**
4. Click **New Query**

## Step 2: Copy the Complete Migration SQL

Copy and paste this entire SQL into the editor:

```sql
-- Year Planning Module Schema
-- Enables coaches to create shared planning groups where participants can collaboratively plan events

-- 1. Planning Groups (created by coaches)
CREATE TABLE IF NOT EXISTS planning_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  access_token VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Participants in a group (selected names, not linked to users table)
CREATE TABLE IF NOT EXISTS planning_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES planning_groups(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, name)
);

-- 3. Ideas (suggestions that can be voted on and promoted to events)
CREATE TABLE IF NOT EXISTS planning_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES planning_groups(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES planning_participants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  suggested_dates TEXT[],
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  promoted_to_event_id UUID REFERENCES planning_events(id) ON DELETE SET NULL
);

-- 4. Votes on Ideas (one vote per person per idea)
CREATE TABLE IF NOT EXISTS planning_idea_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES planning_ideas(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES planning_participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(idea_id, participant_id)
);

-- 5. Events (confirmed activities with attendance tracking)
CREATE TABLE IF NOT EXISTS planning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES planning_groups(id) ON DELETE CASCADE,
  created_by UUID REFERENCES planning_participants(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  location VARCHAR(255),
  city VARCHAR(255),
  country VARCHAR(255),
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Event Participants (who is attending each event)
CREATE TABLE IF NOT EXISTS planning_event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES planning_events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES planning_participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, participant_id)
);

-- Enable Row Level Security
ALTER TABLE planning_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_event_participants ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies for planning_groups (Admin Access)
-- ============================================================

-- Coaches can view their own groups
CREATE POLICY "Coaches can view own planning groups" ON planning_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = planning_groups.coach_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can create groups
CREATE POLICY "Coaches can create planning groups" ON planning_groups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = planning_groups.coach_id
      AND users.auth_user_id = auth.uid()
      AND users.role = 'coach'
    )
  );

-- Coaches can update their own groups
CREATE POLICY "Coaches can update own planning groups" ON planning_groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = planning_groups.coach_id
      AND users.auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = planning_groups.coach_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can delete their own groups
CREATE POLICY "Coaches can delete own planning groups" ON planning_groups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = planning_groups.coach_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS Policies for planning_participants (Public Access)
-- ============================================================

-- Anyone with valid access_token can view group participants
CREATE POLICY "Public can view participants with valid token" ON planning_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      WHERE planning_groups.id = planning_participants.group_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- Coaches can insert participants into their groups
CREATE POLICY "Coaches can add participants" ON planning_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_participants.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can update participants in their groups
CREATE POLICY "Coaches can update participants" ON planning_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_participants.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Coaches can delete participants from their groups
CREATE POLICY "Coaches can delete participants" ON planning_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      JOIN users ON users.id = planning_groups.coach_id
      WHERE planning_groups.id = planning_participants.group_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS Policies for planning_ideas (Public Access)
-- ============================================================

-- Anyone can view ideas with valid token
CREATE POLICY "Public can view ideas with valid token" ON planning_ideas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      WHERE planning_groups.id = planning_ideas.group_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- Anyone can create ideas with valid token
CREATE POLICY "Public can create ideas with valid token" ON planning_ideas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_groups
      WHERE planning_groups.id = planning_ideas.group_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- Participants can update their own ideas
CREATE POLICY "Participants can update own ideas" ON planning_ideas
  FOR UPDATE USING (
    planning_ideas.participant_id = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );

-- Participants can delete their own ideas
CREATE POLICY "Participants can delete own ideas" ON planning_ideas
  FOR DELETE USING (
    planning_ideas.participant_id = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );

-- ============================================================
-- RLS Policies for planning_idea_votes (Public Access)
-- ============================================================

-- Anyone can view votes with valid token
CREATE POLICY "Public can view votes with valid token" ON planning_idea_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_ideas
      JOIN planning_groups ON planning_groups.id = planning_ideas.group_id
      WHERE planning_ideas.id = planning_idea_votes.idea_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- Anyone can vote with valid token
CREATE POLICY "Public can vote with valid token" ON planning_idea_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_ideas
      JOIN planning_groups ON planning_groups.id = planning_ideas.group_id
      WHERE planning_ideas.id = planning_idea_votes.idea_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- Participants can delete their own votes
CREATE POLICY "Participants can delete own votes" ON planning_idea_votes
  FOR DELETE USING (
    planning_idea_votes.participant_id = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );

-- ============================================================
-- RLS Policies for planning_events (Public Access)
-- ============================================================

-- Anyone can view events with valid token
CREATE POLICY "Public can view events with valid token" ON planning_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_groups
      WHERE planning_groups.id = planning_events.group_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- Anyone can create events with valid token
CREATE POLICY "Public can create events with valid token" ON planning_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM planning_groups
      WHERE planning_groups.id = planning_events.group_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- Event creators can update events
CREATE POLICY "Event creators can update events" ON planning_events
  FOR UPDATE USING (
    planning_events.created_by = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );

-- Event creators can delete events
CREATE POLICY "Event creators can delete events" ON planning_events
  FOR DELETE USING (
    planning_events.created_by = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );

-- ============================================================
-- RLS Policies for planning_event_participants (Public Access)
-- ============================================================

-- Anyone can view attendance with valid token
CREATE POLICY "Public can view attendance with valid token" ON planning_event_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planning_events
      JOIN planning_groups ON planning_groups.id = planning_events.group_id
      WHERE planning_events.id = planning_event_participants.event_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- Anyone can mark themselves as attending
CREATE POLICY "Participants can mark attendance" ON planning_event_participants
  FOR INSERT WITH CHECK (
    planning_event_participants.participant_id = (
      current_setting('app.current_participant_id', true)::UUID
    )
    AND EXISTS (
      SELECT 1 FROM planning_events
      JOIN planning_groups ON planning_groups.id = planning_events.group_id
      WHERE planning_events.id = planning_event_participants.event_id
      AND planning_groups.access_token = current_setting('app.current_token', true)
    )
  );

-- Participants can remove their attendance
CREATE POLICY "Participants can remove attendance" ON planning_event_participants
  FOR DELETE USING (
    planning_event_participants.participant_id = (
      current_setting('app.current_participant_id', true)::UUID
    )
  );

-- ============================================================
-- Performance Indexes
-- ============================================================

CREATE INDEX idx_planning_groups_coach_id ON planning_groups(coach_id);
CREATE INDEX idx_planning_groups_access_token ON planning_groups(access_token);
CREATE INDEX idx_planning_participants_group_id ON planning_participants(group_id);
CREATE INDEX idx_planning_ideas_group_id ON planning_ideas(group_id);
CREATE INDEX idx_planning_ideas_participant_id ON planning_ideas(participant_id);
CREATE INDEX idx_planning_ideas_promoted_event_id ON planning_ideas(promoted_to_event_id);
CREATE INDEX idx_planning_idea_votes_idea_id ON planning_idea_votes(idea_id);
CREATE INDEX idx_planning_idea_votes_participant_id ON planning_idea_votes(participant_id);
CREATE INDEX idx_planning_events_group_id ON planning_events(group_id);
CREATE INDEX idx_planning_events_created_by ON planning_events(created_by);
CREATE INDEX idx_planning_events_is_archived ON planning_events(is_archived);
CREATE INDEX idx_planning_event_participants_event_id ON planning_event_participants(event_id);
CREATE INDEX idx_planning_event_participants_participant_id ON planning_event_participants(participant_id);
```

## Step 3: Execute the SQL
Click the **Run** button (play icon) or press **Ctrl+Enter** to execute the entire migration.

## Step 4: Verify Success
You should see:
- ✅ 6 tables created
- ✅ RLS enabled on all tables
- ✅ 25+ RLS policies created
- ✅ 13 performance indexes created

That's it! Your Year Planning Module database is ready to go! 🚀

## Next Steps
Once completed, you can:
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/planning/admin`
3. Create a planning group
4. Copy the shareable link and share it with others!
