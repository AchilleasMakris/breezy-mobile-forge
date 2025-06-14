-- =================================================================
-- MIGRATION SCRIPT TO FIX RLS PERMISSION DENIED ERROR
-- =================================================================
-- This script resolves the "permission denied for schema auth" error.
-- The error occurs because the 'authenticated' role does not have permission
-- to execute functions within the 'auth' schema.

-- The fix involves moving our custom JWT helper function from the 'auth' schema
-- to the 'public' schema, which is accessible by the 'authenticated' role.

-- This version only modifies tables that actually exist in the database.

-- To run this:
-- 1. Go to your Supabase Project dashboard.
-- 2. Navigate to the "SQL Editor".
-- 3. Click "+ New query".
-- 4. Copy and paste the entire content of this file.
-- 5. Click "RUN".

BEGIN;

-- -----------------------------------------------------------------
-- Step 1: Drop the old function from the 'auth' schema
-- -----------------------------------------------------------------
DROP FUNCTION IF EXISTS auth.get_user_id();

-- -----------------------------------------------------------------
-- Step 2: Create a new helper function in the 'public' schema
-- This function extracts the custom 'id' claim from the JWT.
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_id_from_jwt()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'id');
END;
$$ LANGUAGE plpgsql STABLE;

-- -----------------------------------------------------------------
-- Step 3: Update RLS policies only for tables that exist
-- -----------------------------------------------------------------

-- Table: courses (this table exists)
DROP POLICY IF EXISTS "Enable CRUD for user's own courses" ON public.courses;
CREATE POLICY "Enable CRUD for user's own courses" ON public.courses
FOR ALL USING (public.get_user_id_from_jwt() = user_id)
WITH CHECK (public.get_user_id_from_jwt() = user_id);

-- Only add policies for other tables if they exist
-- We'll check if each table exists before trying to modify it

-- Check and update users table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Enable read access for own user record" ON public.users;
        -- Create new policy (optional - only if you want RLS on users table)
        -- CREATE POLICY "Enable read access for own user record" ON public.users 
        -- FOR SELECT USING (public.get_user_id_from_jwt() = id);
    END IF;
END $$;

-- Check and update assignments table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assignments') THEN
        DROP POLICY IF EXISTS "Enable CRUD for user's own assignments" ON public.assignments;
        CREATE POLICY "Enable CRUD for user's own assignments" ON public.assignments
        FOR ALL USING (public.get_user_id_from_jwt() = user_id)
        WITH CHECK (public.get_user_id_from_jwt() = user_id);
    END IF;
END $$;

-- Check and update classes table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classes') THEN
        DROP POLICY IF EXISTS "Enable CRUD for user's own classes" ON public.classes;
        CREATE POLICY "Enable CRUD for user's own classes" ON public.classes
        FOR ALL USING (public.get_user_id_from_jwt() = user_id)
        WITH CHECK (public.get_user_id_from_jwt() = user_id);
    END IF;
END $$;

-- Check and update exams table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exams') THEN
        DROP POLICY IF EXISTS "Enable CRUD for user's own exams" ON public.exams;
        CREATE POLICY "Enable CRUD for user's own exams" ON public.exams
        FOR ALL USING (public.get_user_id_from_jwt() = user_id)
        WITH CHECK (public.get_user_id_from_jwt() = user_id);
    END IF;
END $$;

-- Check and update schedule_entries table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedule_entries') THEN
        DROP POLICY IF EXISTS "Enable CRUD for user's own schedule" ON public.schedule_entries;
        CREATE POLICY "Enable CRUD for user's own schedule" ON public.schedule_entries
        FOR ALL USING (public.get_user_id_from_jwt() = user_id)
        WITH CHECK (public.get_user_id_from_jwt() = user_id);
    END IF;
END $$;

COMMIT;

-- =================================================================
-- END OF MIGRATION SCRIPT
-- ================================================================= 