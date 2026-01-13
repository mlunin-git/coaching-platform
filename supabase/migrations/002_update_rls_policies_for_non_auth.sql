-- Migration: Update RLS policies to support non-email clients
-- This migration updates all RLS policies to use auth_user_id instead of id
-- and ensures non-authenticated clients cannot access data directly

-- ============================================
-- RLS Policies for users table
-- ============================================

DROP POLICY IF EXISTS "Users can read their own profile" ON users;
CREATE POLICY "Users can read their own profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Coaches can read their clients' profiles" ON users;
CREATE POLICY "Coaches can read their clients' profiles" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users coaches ON coaches.id = clients.coach_id
      WHERE clients.user_id = users.id
      AND coaches.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- ============================================
-- RLS Policies for clients table
-- ============================================

DROP POLICY IF EXISTS "Coaches can read their own clients" ON clients;
CREATE POLICY "Coaches can read their own clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = clients.coach_id
      AND users.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clients can read their own client record" ON clients;
CREATE POLICY "Clients can read their own client record" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = clients.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Coaches can insert clients" ON clients;
CREATE POLICY "Coaches can insert clients" ON clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = clients.coach_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- ============================================
-- RLS Policies for tasks table
-- ============================================

DROP POLICY IF EXISTS "Coaches can read their own tasks" ON tasks;
CREATE POLICY "Coaches can read their own tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = tasks.coach_id
      AND users.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clients can read all tasks" ON tasks;
CREATE POLICY "Clients can read all tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users ON users.id = clients.user_id
      WHERE clients.user_id = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Coaches can insert tasks" ON tasks;
CREATE POLICY "Coaches can insert tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = tasks.coach_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- ============================================
-- RLS Policies for client_tasks table
-- ============================================

DROP POLICY IF EXISTS "Coaches can read their clients' task statuses" ON client_tasks;
CREATE POLICY "Coaches can read their clients' task statuses" ON client_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users ON users.id = clients.coach_id
      WHERE clients.id = client_tasks.client_id
      AND users.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clients can read their own task statuses" ON client_tasks;
CREATE POLICY "Clients can read their own task statuses" ON client_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users ON users.id = clients.user_id
      WHERE clients.id = client_tasks.client_id
      AND users.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Coaches can insert client tasks" ON client_tasks;
CREATE POLICY "Coaches can insert client tasks" ON client_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users ON users.id = clients.coach_id
      WHERE clients.id = client_tasks.client_id
      AND users.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clients can update their own task status" ON client_tasks;
CREATE POLICY "Clients can update their own task status" ON client_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users ON users.id = clients.user_id
      WHERE clients.id = client_tasks.client_id
      AND users.auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      JOIN users ON users.id = clients.user_id
      WHERE clients.id = client_tasks.client_id
      AND users.auth_user_id = auth.uid()
    )
  );
