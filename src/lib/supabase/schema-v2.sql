-- ============================================
-- SKILLSHARE — Schema Migration V2
-- Run this in the Supabase SQL Editor
-- Adds: connection_requests, is_admin, unique constraints,
--        updated notification types, timeslot update policy
-- ============================================

-- ============================================
-- 1. CONNECTION REQUESTS TABLE
-- ============================================

CREATE TABLE public.connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  timeslot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent duplicate offers from same giver on same post
  UNIQUE (post_id, giver_id)
);

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Givers can see their own requests + seekers can see requests on their posts
CREATE POLICY "Users can view relevant connection requests"
  ON public.connection_requests FOR SELECT
  USING (
    auth.uid() = giver_id
    OR auth.uid() = (SELECT user_id FROM public.posts WHERE id = post_id)
  );

-- Authenticated users can create connection requests
CREATE POLICY "Authenticated users can create connection requests"
  ON public.connection_requests FOR INSERT
  WITH CHECK (auth.uid() = giver_id);

-- Post owner (seeker) can accept/decline requests
CREATE POLICY "Post owner can update connection requests"
  ON public.connection_requests FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM public.posts WHERE id = post_id)
  );

-- Giver can delete their own pending request (withdraw offer)
CREATE POLICY "Giver can delete own pending requests"
  ON public.connection_requests FOR DELETE
  USING (auth.uid() = giver_id AND status = 'pending');


-- ============================================
-- 2. ADD is_admin TO PROFILES
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;


-- ============================================
-- 3. UNIQUE CONSTRAINT ON SESSIONS.TIMESLOT_ID
--    Prevents two sessions from booking the same slot
-- ============================================

ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_timeslot_unique UNIQUE (timeslot_id);


-- ============================================
-- 4. ADD NEW NOTIFICATION TYPES
--    The original schema only allowed specific types.
--    We need to add types for the new connection request flow.
-- ============================================

-- Drop the old check constraint and add a wider one
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'connection_request',   -- giver offered help
    'request_accepted',     -- seeker accepted your offer
    'request_declined',     -- seeker declined your offer
    'session_confirmed',    -- session is scheduled
    'session_cancelled',    -- session was cancelled
    'session_reminder',     -- upcoming session reminder
    'rating_received',      -- someone rated you
    'credits_earned',       -- you earned credits
    'credits_purchased'     -- you purchased credits
  ));


-- ============================================
-- 5. ALLOW AUTHENTICATED USERS TO UPDATE TIME SLOTS
--    Needed so givers' accepted requests can book slots
-- ============================================

-- Check if this policy already exists; drop and recreate to be safe
DROP POLICY IF EXISTS "Authenticated users can update time slots" ON public.time_slots;

CREATE POLICY "Authenticated users can update time slots"
  ON public.time_slots FOR UPDATE
  USING (auth.role() = 'authenticated');


-- ============================================
-- 6. ALLOW AUTHENTICATED USERS TO INSERT NOTIFICATIONS
--    (already exists but ensure it's correct)
-- ============================================

-- No change needed — existing policy allows inserts.


-- ============================================
-- 7. SET YOUR ADMIN USER
--    Replace the email below with your actual email
--    to get admin access.
-- ============================================

-- UPDATE public.profiles SET is_admin = true WHERE email = 'YOUR_EMAIL@example.com';
