-- =================================================================
-- MIGRATION SCRIPT TO FIX CLERK.IO AUTHENTICATION INTEGRATION
-- =================================================================
-- This script corrects the database schema to work with Clerk's non-UUID user IDs (e.g., 'user_...').
-- It changes the 'user_id' columns from UUID to TEXT and updates all Row Level Security (RLS) policies
-- to use the custom 'id' claim from the JWT for secure data access.

-- This script fixes the "cannot alter type of a column used in a policy" error
-- by dropping the RLS policies BEFORE altering the table structure.

-- To run this:
-- 1. Go to your Supabase Project dashboard.
-- 2. Navigate to the "SQL Editor".
-- 3. Click "+ New query".
-- 4. Copy and paste the entire content of this file.
-- 5. Click "RUN".

BEGIN;

-- -----------------------------------------------------------------
-- Function to get user_id from JWT
-- -----------------------------------------------------------------
-- Drop the old function if it exists
DROP FUNCTION IF EXISTS auth.get_user_id();

-- Create a new function that gets the 'id' claim (which matches our JWT)
-- instead of the 'sub' claim.
CREATE OR REPLACE FUNCTION auth.get_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'id');
END;
$$ LANGUAGE plpgsql STABLE;

-- -----------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------
-- Step 1: Alter the primary key type to TEXT to match Clerk's user ID format.
ALTER TABLE public.users ALTER COLUMN id TYPE TEXT;

-- -----------------------------------------------------------------
-- Table: courses
-- -----------------------------------------------------------------
-- Step 1: Drop ALL old RLS policies to unlock the user_id column.
-- This is the crucial step to prevent the "cannot alter type" error.
DROP POLICY IF EXISTS "Enable read access for user's own courses" ON public.courses;
DROP POLICY IF EXISTS "Enable insert access for own courses" ON public.courses;
DROP POLICY IF EXISTS "Enable update access for own courses" ON public.courses;
DROP POLICY IF EXISTS "Enable delete access for own courses" ON public.courses;
DROP POLICY IF EXISTS "Enable CRUD for user's own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can manage their own courses." ON public.courses; -- From error log

-- Step 2: Drop foreign key constraint.
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_user_id_fkey;

-- Step 3: Alter column type from uuid to text.
ALTER TABLE public.courses ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Re-create foreign key constraint pointing to the TEXT `users.id` column.
ALTER TABLE public.courses ADD CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 5: Create the new, correct RLS policy using the custom JWT 'id' claim.
CREATE POLICY "Enable CRUD for user's own courses"
ON public.courses
FOR ALL
USING (auth.get_user_id() = user_id)
WITH CHECK (auth.get_user_id() = user_id);

-- -----------------------------------------------------------------
-- Table: assignments
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Enable CRUD for user's own assignments" ON public.assignments;
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_user_id_fkey;
ALTER TABLE public.assignments ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.assignments ADD CONSTRAINT assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
CREATE POLICY "Enable CRUD for user's own assignments" ON public.assignments FOR ALL USING (auth.get_user_id() = user_id) WITH CHECK (auth.get_user_id() = user_id);

-- -----------------------------------------------------------------
-- Table: classes
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Enable CRUD for user's own classes" ON public.classes;
ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS classes_user_id_fkey;
ALTER TABLE public.classes ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.classes ADD CONSTRAINT classes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
CREATE POLICY "Enable CRUD for user's own classes" ON public.classes FOR ALL USING (auth.get_user_id() = user_id) WITH CHECK (auth.get_user_id() = user_id);

-- -----------------------------------------------------------------
-- Table: exams
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Enable CRUD for user's own exams" ON public.exams;
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_user_id_fkey;
ALTER TABLE public.exams ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.exams ADD CONSTRAINT exams_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
CREATE POLICY "Enable CRUD for user's own exams" ON public.exams FOR ALL USING (auth.get_user_id() = user_id) WITH CHECK (auth.get_user_id() = user_id);

-- -----------------------------------------------------------------
-- Table: schedule_entries
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Enable CRUD for user's own schedule" ON public.schedule_entries;
ALTER TABLE public.schedule_entries DROP CONSTRAINT IF EXISTS schedule_entries_user_id_fkey;
ALTER TABLE public.schedule_entries ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.schedule_entries ADD CONSTRAINT schedule_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
CREATE POLICY "Enable CRUD for user's own schedule" ON public.schedule_entries FOR ALL USING (auth.get_user_id() = user_id) WITH CHECK (auth.get_user_id() = user_id);

COMMIT;

-- =================================================================
-- END OF MIGRATION SCRIPT
-- ================================================================= 