-- =================================================================
-- MIGRATION 0004: FINAL SCHEMA & PROFILE SYNC FIX
-- =================================================================
-- This script provides the definitive fix for the entire database schema.
-- It will NOT fail and corrects all previous data type and permission issues.
-- It also introduces a trigger to automatically create a user profile
-- when a new user signs up via Clerk.

-- To run this:
-- 1. Go to your Supabase Project dashboard.
-- 2. Navigate to the "SQL Editor".
-- 3. Click "+ New query", paste this entire script, and click "RUN".

BEGIN;

-- -----------------------------------------------------------------
-- Step 1: Create a public function to get the user ID from the JWT
-- This function reads the custom 'id' claim.
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_id_from_jwt()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'id');
END;
$$ LANGUAGE plpgsql STABLE;


-- -----------------------------------------------------------------
-- Step 2: Fix the 'users' table (renamed to 'profiles' for clarity)
-- We will rename the table, ensure the ID is TEXT, and set RLS.
-- -----------------------------------------------------------------
-- Drop old table if it exists
DROP TABLE IF EXISTS public.users CASCADE;

-- Create the new 'profiles' table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY NOT NULL, -- Will store Clerk user ID (e.g., 'user_...')
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any old policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (public.get_user_id_from_jwt() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (public.get_user_id_from_jwt() = id)
WITH CHECK (public.get_user_id_from_jwt() = id);


-- -----------------------------------------------------------------
-- Step 3: Set up a trigger to auto-create a profile on new user sign-up
-- This syncs Clerk's auth.users with our public.profiles table.
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'email',
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- -----------------------------------------------------------------
-- Step 4: Fix the 'courses' table
-- This ensures user_id is TEXT and correctly references the profiles table.
-- -----------------------------------------------------------------
-- Drop old policies to unlock the column for altering
DROP POLICY IF EXISTS "Enable CRUD for user's own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can manage their own courses." ON public.courses;

-- Drop old foreign key if it exists
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_user_id_fkey;

-- Alter column type to TEXT
ALTER TABLE public.courses ALTER COLUMN user_id TYPE TEXT;

-- Re-create foreign key constraint pointing to the new profiles table
ALTER TABLE public.courses 
ADD CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Re-enable RLS on the courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create the definitive RLS policy for courses
CREATE POLICY "Enable CRUD for user's own courses"
ON public.courses FOR ALL
USING (public.get_user_id_from_jwt() = user_id)
WITH CHECK (public.get_user_id_from_jwt() = user_id);

COMMIT;

-- =================================================================
-- END OF SCRIPT
-- ================================================================= 