-- =====================================================
-- PENTATHLON BUZZER APP - DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- Drop existing table if you need a fresh start (WARNING: deletes all data)
-- DROP TABLE IF EXISTS public.schools CASCADE;

-- Create schools table with session management
CREATE TABLE IF NOT EXISTS public.schools (
  id BIGSERIAL PRIMARY KEY,
  
  -- School identification
  school_name TEXT NOT NULL UNIQUE,
  
  -- Session management (prevents device hijacking)
  session_token TEXT,
  session_expires TIMESTAMPTZ,
  
  -- Timestamps
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pressed_at TIMESTAMPTZ,
  
  -- Counter (incremented each time buzzer is pressed)
  press_count BIGINT NOT NULL DEFAULT 0,
  
  -- Audit timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_schools_school_name ON public.schools(school_name);
CREATE INDEX IF NOT EXISTS idx_schools_pressed_at ON public.schools(pressed_at);
CREATE INDEX IF NOT EXISTS idx_schools_session_token ON public.schools(session_token);

-- =====================================================
-- TRIGGER 1: Auto-update pressed_at and press_count
-- =====================================================
CREATE OR REPLACE FUNCTION public.on_buzzer_press()
RETURNS TRIGGER AS $$
BEGIN
  -- If client is updating pressed_at, force it to NOW() and increment counter
  IF NEW.pressed_at IS DISTINCT FROM OLD.pressed_at THEN
    NEW.pressed_at = NOW();
    NEW.press_count = OLD.press_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_on_buzzer_press ON public.schools;
CREATE TRIGGER trg_on_buzzer_press
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.on_buzzer_press();

-- =====================================================
-- TRIGGER 2: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.schools;
CREATE TRIGGER trg_set_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- DISABLE RLS - ALLOW PUBLIC ACCESS
-- =====================================================
-- This allows anonymous users to read and write without authentication
ALTER TABLE public.schools DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OPTIONAL: Create a view for leaderboard queries
-- =====================================================
CREATE OR REPLACE VIEW public.schools_leaderboard AS
SELECT 
  id,
  school_name,
  pressed_at,
  press_count,
  created_at
FROM public.schools
WHERE pressed_at IS NOT NULL
ORDER BY pressed_at ASC;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup worked:

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'schools'
ORDER BY ordinal_position;

-- Check if RLS is disabled (should return 'f' for false)
SELECT relrowsecurity 
FROM pg_class 
WHERE relname = 'schools' AND relnamespace = 'public'::regnamespace;

-- Check triggers are created
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'schools';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '✅ Table created: public.schools';
  RAISE NOTICE '✅ RLS disabled - public access enabled';
  RAISE NOTICE '✅ Triggers created for auto-updates';
  RAISE NOTICE '';
  RAISE NOTICE 'Your app should now work. Try:';
  RAISE NOTICE '1. Add a school name';
  RAISE NOTICE '2. Press the buzzer';
  RAISE NOTICE '3. View the leaderboard';
END $$;
