-- Fix RLS policy to allow reading profile during login
-- This policy allows authenticated users to read their profile by auth_user_id

CREATE POLICY "Authenticated users can read profile by auth_user_id" ON users
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    auth_user_id = auth.uid()
  );
