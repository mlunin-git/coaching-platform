-- Migration: Add support for non-email clients (clients without authentication)
-- This migration adds new columns to support clients that don't have email addresses
-- and cannot log into the system. They will be managed entirely by their coaches.

-- Add new columns to users table
ALTER TABLE users ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN client_identifier VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN has_auth_access BOOLEAN DEFAULT true;

-- Backfill auth_user_id for all existing users
-- (they all came from Supabase Auth, so their id matches their auth.users.id)
UPDATE users SET auth_user_id = id;

-- Backfill has_auth_access for existing users (they should have access)
UPDATE users SET has_auth_access = true WHERE auth_user_id IS NOT NULL;

-- Make email nullable (after backfilling existing data)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Drop the old foreign key constraint (users.id -> auth.users.id)
-- We no longer want users.id to be directly tied to auth.users.id
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add constraint to ensure users have either email OR client_identifier, but not both or neither
ALTER TABLE users ADD CONSTRAINT users_identifier_check
  CHECK (
    (email IS NOT NULL AND client_identifier IS NULL) OR
    (email IS NULL AND client_identifier IS NOT NULL)
  );

-- Create indexes for performance
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_client_identifier ON users(client_identifier);
