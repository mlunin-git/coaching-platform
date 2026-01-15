-- Add messaging functionality
-- Create messages table for coach-client conversations

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('coach', 'client')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Coaches can read all messages for their clients
CREATE POLICY "Coaches can read their clients' messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users coaches ON coaches.id = clients.coach_id
      WHERE clients.id = messages.client_id
      AND coaches.auth_user_id = auth.uid()
    )
  );

-- RLS Policy 2: Authenticated clients can read messages in their conversation
CREATE POLICY "Clients can read their own messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users ON users.id = clients.user_id
      WHERE clients.id = messages.client_id
      AND users.auth_user_id = auth.uid()
      AND users.has_auth_access = true
    )
  );

-- RLS Policy 3: Coaches can insert messages for their clients
CREATE POLICY "Coaches can send messages to their clients" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users coaches ON coaches.id = clients.coach_id
      WHERE clients.id = messages.client_id
      AND coaches.auth_user_id = auth.uid()
    )
  );

-- RLS Policy 4: Authenticated clients can insert messages
CREATE POLICY "Clients can send messages to their coach" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users ON users.id = clients.user_id
      WHERE clients.id = messages.client_id
      AND users.auth_user_id = auth.uid()
      AND users.has_auth_access = true
    )
    AND sender_type = 'client'
  );

-- RLS Policy 5: Coaches can update message read status
CREATE POLICY "Coaches can mark messages as read" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users coaches ON coaches.id = clients.coach_id
      WHERE clients.id = messages.client_id
      AND coaches.auth_user_id = auth.uid()
    )
  );

-- RLS Policy 6: Authenticated clients can update message read status
CREATE POLICY "Clients can mark messages as read" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users ON users.id = clients.user_id
      WHERE clients.id = messages.client_id
      AND users.auth_user_id = auth.uid()
      AND users.has_auth_access = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_client_read ON messages(client_id, is_read, created_at DESC);
