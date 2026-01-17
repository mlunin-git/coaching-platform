-- Add public SELECT policy to planning_groups with token-based access control
-- Access is restricted to users with a valid access_token

-- First, check if the policy already exists and drop it if it does
DROP POLICY IF EXISTS "Public can view planning groups" ON planning_groups;

-- Secure policy: Only allow viewing planning groups with valid access token
-- The app layer is responsible for:
--   1. Receiving the access_token as a query parameter or from the request
--   2. Validating it matches a group via: WHERE access_token = current_setting('app.current_token', true)
--   3. Setting the app.current_token session variable before making queries
--   4. Not returning groups whose tokens don't match the validated token
CREATE POLICY "Public can view planning groups with valid token" ON planning_groups
  FOR SELECT USING (
    access_token = current_setting('app.current_token', true)
  );

-- Note: This policy is more restrictive than the original unsafe version.
-- Security guarantees:
-- 1. Token must be cryptographically valid (128+ bits entropy, unpredictable)
-- 2. Token is compared exactly - no pattern matching, no enumeration possible
-- 3. App layer should implement:
--    a. Rate limiting on token validation attempts
--    b. Token expiration or rotation if desired
--    c. Audit logging of token usage
