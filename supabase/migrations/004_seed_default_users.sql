-- Seed default users for testing
-- Password: demo123 (to be set via Auth)
-- Coach: coach@example.com
-- Client: client@example.com

-- Insert default coach user
-- Note: auth_user_id will be set after creating the Auth user
INSERT INTO users (id, auth_user_id, email, role, name, has_auth_access, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  NULL,  -- Will be updated after creating Auth user
  'coach@example.com',
  'coach',
  'Demo Coach',
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert default client user
INSERT INTO users (id, auth_user_id, email, role, name, has_auth_access, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  NULL,  -- Will be updated after creating Auth user
  'client@example.com',
  'client',
  'Demo Client',
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create relationship: coach manages the client
INSERT INTO clients (id, coach_id, user_id, name, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Demo Client',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create a sample task
INSERT INTO tasks (id, coach_id, title, description, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Welcome Task',
  'This is a sample task. Complete it when ready!',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Assign task to client
INSERT INTO client_tasks (id, client_id, task_id, status, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  'pending',
  NOW()
) ON CONFLICT (id) DO NOTHING;
