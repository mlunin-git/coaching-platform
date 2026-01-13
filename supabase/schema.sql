-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('coach', 'client')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, user_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create client_tasks table
CREATE TABLE IF NOT EXISTS client_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, task_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for clients table
CREATE POLICY "Coaches can read their own clients" ON clients
  FOR SELECT USING (coach_id = auth.uid());

CREATE POLICY "Clients can read their own client record" ON clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Coaches can insert clients" ON clients
  FOR INSERT WITH CHECK (coach_id = auth.uid());

-- RLS Policies for tasks table
CREATE POLICY "Coaches can read their own tasks" ON tasks
  FOR SELECT USING (coach_id = auth.uid());

CREATE POLICY "Clients can read all tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients WHERE clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can insert tasks" ON tasks
  FOR INSERT WITH CHECK (coach_id = auth.uid());

-- RLS Policies for client_tasks table
CREATE POLICY "Coaches can read their clients' task statuses" ON client_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_tasks.client_id
      AND clients.coach_id = auth.uid()
    )
  );

CREATE POLICY "Clients can read their own task statuses" ON client_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can insert client tasks" ON client_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_tasks.client_id
      AND clients.coach_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update their own task status" ON client_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_tasks.client_id
      AND clients.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_clients_coach_id ON clients(coach_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_tasks_coach_id ON tasks(coach_id);
CREATE INDEX idx_client_tasks_client_id ON client_tasks(client_id);
CREATE INDEX idx_client_tasks_task_id ON client_tasks(task_id);
