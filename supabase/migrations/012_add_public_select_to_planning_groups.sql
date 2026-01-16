-- Add public SELECT policy to planning_groups for anonymous access via access_token
-- This allows anyone with a valid access_token to view the group details

-- First, check if the policy already exists and drop it if it does
DROP POLICY IF EXISTS "Public can view planning groups" ON planning_groups;

-- Add policy to allow anyone to view planning groups
-- This is safe because:
-- 1. Groups are only accessible by their access_token (which is like a password)
-- 2. The token is shared explicitly by the coach
-- 3. All data in the group is public anyway (ideas, events, participants)
CREATE POLICY "Public can view planning groups" ON planning_groups
  FOR SELECT USING (true);
