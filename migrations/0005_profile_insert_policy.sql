-- =================================================================
-- MIGRATION 0005: ALLOW USERS TO INSERT INTO profiles
-- =================================================================
-- Adds a Row Level Security policy that permits a signed-in user to
-- insert (create) their own profile row. This is required for the
-- fallback profile-creation logic in SupabaseProvider to succeed.

BEGIN;

-- Enable RLS if not already enabled (safety)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create new INSERT policy
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (public.get_user_id_from_jwt() = id);

COMMIT;

-- =================================================================
-- END OF SCRIPT
-- ================================================================= 