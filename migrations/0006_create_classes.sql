-- =============================================================
-- MIGRATION 0006: CREATE classes TABLE WITH RLS
-- =============================================================
BEGIN;

-- create extension for uuid if not exists (pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. create table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  professor TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  meeting_link TEXT,
  classroom TEXT,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- 3. policy allowing CRUD for owner
CREATE POLICY "Allow owner access" ON public.classes
FOR ALL USING (public.get_user_id_from_jwt() = user_id) WITH CHECK (public.get_user_id_from_jwt() = user_id);

COMMIT;

-- ============================================================= 