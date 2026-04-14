-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- CoachAthleteConnect Application
-- ============================================
-- 
-- This file contains all RLS policies for the application.
-- Run this after creating the database schema.
--
-- IMPORTANT: These policies assume you're using Supabase Auth
-- where auth.uid() returns the authenticated user's ID.
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booked_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_schedule_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_session_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can read their own data
CREATE POLICY "users_select_own"
ON users FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Users can update their own data (except sensitive fields)
CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Users can insert their own record (for registration)
CREATE POLICY "users_insert_own"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = id);

-- ============================================
-- ATHLETE PROFILES POLICIES
-- ============================================

-- Athletes can read their own profile
CREATE POLICY "athlete_profiles_select_own"
ON athlete_profiles FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- Coaches can read athlete profiles of their connections
CREATE POLICY "athlete_profiles_select_connected"
ON athlete_profiles FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT athlete_id FROM connections
    WHERE coach_id = auth.uid()::text
    AND status = 'ACCEPTED'
  )
);

-- Athletes can create their own profile
CREATE POLICY "athlete_profiles_insert_own"
ON athlete_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Athletes can update their own profile
CREATE POLICY "athlete_profiles_update_own"
ON athlete_profiles FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Athletes can delete their own profile
CREATE POLICY "athlete_profiles_delete_own"
ON athlete_profiles FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- ============================================
-- COACH PROFILES POLICIES
-- ============================================

-- Anyone authenticated can read coach profiles (for browsing/discovery)
CREATE POLICY "coach_profiles_select_all"
ON coach_profiles FOR SELECT
TO authenticated
USING (true);

-- Coaches can create their own profile
CREATE POLICY "coach_profiles_insert_own"
ON coach_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Coaches can update their own profile
CREATE POLICY "coach_profiles_update_own"
ON coach_profiles FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Coaches can delete their own profile
CREATE POLICY "coach_profiles_delete_own"
ON coach_profiles FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- ============================================
-- CONNECTIONS POLICIES
-- ============================================

-- Athletes can read their own connections
CREATE POLICY "connections_select_athlete"
ON connections FOR SELECT
TO authenticated
USING (auth.uid()::text = athlete_id);

-- Coaches can read connections where they are the coach
CREATE POLICY "connections_select_coach"
ON connections FOR SELECT
TO authenticated
USING (auth.uid()::text = coach_id);

-- Athletes can create connection requests (to coaches)
CREATE POLICY "connections_insert_athlete"
ON connections FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = athlete_id);

-- Coaches can update connections (accept/decline requests)
CREATE POLICY "connections_update_coach"
ON connections FOR UPDATE
TO authenticated
USING (auth.uid()::text = coach_id);

-- Athletes can delete their own pending connection requests
CREATE POLICY "connections_delete_athlete"
ON connections FOR DELETE
TO authenticated
USING (
  auth.uid()::text = athlete_id 
  AND status = 'PENDING'
);

-- Coaches can delete connections
CREATE POLICY "connections_delete_coach"
ON connections FOR DELETE
TO authenticated
USING (auth.uid()::text = coach_id);

-- ============================================
-- TIME SLOT REQUESTS POLICIES
-- ============================================

-- Athletes can read their own requests
CREATE POLICY "time_slot_requests_select_athlete"
ON time_slot_requests FOR SELECT
TO authenticated
USING (auth.uid()::text = athlete_id);

-- Coaches can read requests directed to them
CREATE POLICY "time_slot_requests_select_coach"
ON time_slot_requests FOR SELECT
TO authenticated
USING (auth.uid()::text = coach_id);

-- Athletes can create requests
CREATE POLICY "time_slot_requests_insert_athlete"
ON time_slot_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = athlete_id);

-- Coaches can update requests (accept/decline)
CREATE POLICY "time_slot_requests_update_coach"
ON time_slot_requests FOR UPDATE
TO authenticated
USING (auth.uid()::text = coach_id);

-- Athletes can update their own pending requests
CREATE POLICY "time_slot_requests_update_athlete"
ON time_slot_requests FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = athlete_id 
  AND status = 'PENDING'
);

-- Athletes can delete their own pending requests
CREATE POLICY "time_slot_requests_delete_athlete"
ON time_slot_requests FOR DELETE
TO authenticated
USING (
  auth.uid()::text = athlete_id 
  AND status = 'PENDING'
);

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Anyone can read reviews (public)
CREATE POLICY "reviews_select_all"
ON reviews FOR SELECT
TO authenticated
USING (true);

-- Athletes can create reviews for coaches they've had sessions with
CREATE POLICY "reviews_insert_athlete"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = athlete_id
  AND EXISTS (
    SELECT 1 FROM booked_sessions
    WHERE athlete_id = auth.uid()::text
    AND coach_id = reviews.coach_id
    AND status = 'COMPLETED'
  )
);

-- Athletes can update their own reviews
CREATE POLICY "reviews_update_athlete"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid()::text = athlete_id);

-- Athletes can delete their own reviews
CREATE POLICY "reviews_delete_athlete"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid()::text = athlete_id);

-- ============================================
-- COACH AVAILABILITY RULES POLICIES
-- ============================================

-- Anyone authenticated can read availability rules (for scheduling)
CREATE POLICY "availability_rules_select_all"
ON coach_availability_rules FOR SELECT
TO authenticated
USING (true);

-- Coaches can create their own availability rules
CREATE POLICY "availability_rules_insert_coach"
ON coach_availability_rules FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = coach_id);

-- Coaches can update their own availability rules
CREATE POLICY "availability_rules_update_coach"
ON coach_availability_rules FOR UPDATE
TO authenticated
USING (auth.uid()::text = coach_id);

-- Coaches can delete their own availability rules
CREATE POLICY "availability_rules_delete_coach"
ON coach_availability_rules FOR DELETE
TO authenticated
USING (auth.uid()::text = coach_id);

-- ============================================
-- COACH AVAILABILITY EXCEPTIONS POLICIES
-- ============================================

-- Anyone authenticated can read availability exceptions (for scheduling)
CREATE POLICY "availability_exceptions_select_all"
ON coach_availability_exceptions FOR SELECT
TO authenticated
USING (true);

-- Coaches can create their own availability exceptions
CREATE POLICY "availability_exceptions_insert_coach"
ON coach_availability_exceptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = coach_id);

-- Coaches can update their own availability exceptions
CREATE POLICY "availability_exceptions_update_coach"
ON coach_availability_exceptions FOR UPDATE
TO authenticated
USING (auth.uid()::text = coach_id);

-- Coaches can delete their own availability exceptions
CREATE POLICY "availability_exceptions_delete_coach"
ON coach_availability_exceptions FOR DELETE
TO authenticated
USING (auth.uid()::text = coach_id);

-- ============================================
-- BOOKED SESSIONS POLICIES
-- ============================================

-- Athletes can read their own booked sessions
CREATE POLICY "booked_sessions_select_athlete"
ON booked_sessions FOR SELECT
TO authenticated
USING (auth.uid()::text = athlete_id);

-- Coaches can read sessions they're coaching
CREATE POLICY "booked_sessions_select_coach"
ON booked_sessions FOR SELECT
TO authenticated
USING (auth.uid()::text = coach_id);

-- Coaches can create booked sessions (when accepting requests)
CREATE POLICY "booked_sessions_insert_coach"
ON booked_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = coach_id);

-- Coaches can update their booked sessions
CREATE POLICY "booked_sessions_update_coach"
ON booked_sessions FOR UPDATE
TO authenticated
USING (auth.uid()::text = coach_id);

-- Athletes can update sessions they're part of (limited)
CREATE POLICY "booked_sessions_update_athlete"
ON booked_sessions FOR UPDATE
TO authenticated
USING (auth.uid()::text = athlete_id);

-- Both parties can cancel (delete) booked sessions
CREATE POLICY "booked_sessions_delete_participant"
ON booked_sessions FOR DELETE
TO authenticated
USING (
  auth.uid()::text = athlete_id 
  OR auth.uid()::text = coach_id
);

-- ============================================
-- COACH SCHEDULE TEMPLATES POLICIES
-- ============================================

-- Anyone authenticated can read public schedule templates
CREATE POLICY "schedule_templates_select_public"
ON coach_schedule_templates FOR SELECT
TO authenticated
USING (is_public = 1);

-- Coaches can read their own templates (public or private)
CREATE POLICY "schedule_templates_select_own"
ON coach_schedule_templates FOR SELECT
TO authenticated
USING (auth.uid()::text = coach_id);

-- Coaches can create their own templates
CREATE POLICY "schedule_templates_insert_coach"
ON coach_schedule_templates FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = coach_id);

-- Coaches can update their own templates
CREATE POLICY "schedule_templates_update_coach"
ON coach_schedule_templates FOR UPDATE
TO authenticated
USING (auth.uid()::text = coach_id);

-- Coaches can delete their own templates
CREATE POLICY "schedule_templates_delete_coach"
ON coach_schedule_templates FOR DELETE
TO authenticated
USING (auth.uid()::text = coach_id);

-- ============================================
-- COACH SCHEDULE TEMPLATE ITEMS POLICIES
-- ============================================

-- Anyone can read items from public templates
CREATE POLICY "schedule_items_select_public"
ON coach_schedule_template_items FOR SELECT
TO authenticated
USING (
  template_id IN (
    SELECT id FROM coach_schedule_templates
    WHERE is_public = 1
  )
);

-- Coaches can read items from their own templates
CREATE POLICY "schedule_items_select_own"
ON coach_schedule_template_items FOR SELECT
TO authenticated
USING (
  template_id IN (
    SELECT id FROM coach_schedule_templates
    WHERE coach_id = auth.uid()::text
  )
);

-- Coaches can create items in their own templates
CREATE POLICY "schedule_items_insert_coach"
ON coach_schedule_template_items FOR INSERT
TO authenticated
WITH CHECK (
  template_id IN (
    SELECT id FROM coach_schedule_templates
    WHERE coach_id = auth.uid()::text
  )
);

-- Coaches can update items in their own templates
CREATE POLICY "schedule_items_update_coach"
ON coach_schedule_template_items FOR UPDATE
TO authenticated
USING (
  template_id IN (
    SELECT id FROM coach_schedule_templates
    WHERE coach_id = auth.uid()::text
  )
);

-- Coaches can delete items from their own templates
CREATE POLICY "schedule_items_delete_coach"
ON coach_schedule_template_items FOR DELETE
TO authenticated
USING (
  template_id IN (
    SELECT id FROM coach_schedule_templates
    WHERE coach_id = auth.uid()::text
  )
);

-- ============================================
-- TRAINING SESSION REQUESTS POLICIES
-- ============================================

-- Athletes can read their own training requests
CREATE POLICY "training_requests_select_athlete"
ON training_session_requests FOR SELECT
TO authenticated
USING (auth.uid()::text = athlete_id);

-- Coaches can read requests directed to them
CREATE POLICY "training_requests_select_coach"
ON training_session_requests FOR SELECT
TO authenticated
USING (auth.uid()::text = coach_id);

-- Athletes can create training requests
CREATE POLICY "training_requests_insert_athlete"
ON training_session_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = athlete_id);

-- Coaches can update requests (accept/decline/schedule)
CREATE POLICY "training_requests_update_coach"
ON training_session_requests FOR UPDATE
TO authenticated
USING (auth.uid()::text = coach_id);

-- Athletes can update their own pending requests
CREATE POLICY "training_requests_update_athlete"
ON training_session_requests FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = athlete_id 
  AND status = 'PENDING'
);

-- Athletes can delete their own pending requests
CREATE POLICY "training_requests_delete_athlete"
ON training_session_requests FOR DELETE
TO authenticated
USING (
  auth.uid()::text = athlete_id 
  AND status = 'PENDING'
);

-- ============================================
-- SESSIONS TABLE (Express Session Store)
-- ============================================
-- Note: This table is used by express-session and doesn't need RLS
-- as it's only accessed server-side
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TESTING RLS POLICIES
-- ============================================
-- 
-- To test if RLS is working correctly:
-- 
-- 1. Create a test user via Supabase Auth
-- 2. Use their JWT token in queries
-- 3. Try to access other users' data (should fail)
-- 4. Try to access own data (should succeed)
--
-- Example query to test as a specific user:
-- SET LOCAL role TO authenticated;
-- SET LOCAL request.jwt.claim.sub TO '<user-id>';
-- SELECT * FROM athlete_profiles;
-- 
-- ============================================
