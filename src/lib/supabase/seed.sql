-- ============================================
-- SKILLSHARE — Seed Data (Example Posts)
-- Run this in the Supabase SQL Editor
-- ============================================

-- First, create some demo helper profiles
-- (these are fake users just for demo purposes)

INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'maria.demo@skillshare.test', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now(), now(), '', ''),
  ('b2222222-2222-2222-2222-222222222222', 'thomas.demo@skillshare.test', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now(), now(), '', ''),
  ('c3333333-3333-3333-3333-333333333333', 'sarah.demo@skillshare.test', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now(), now(), '', ''),
  ('d4444444-4444-4444-4444-444444444444', 'james.demo@skillshare.test', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now(), now(), '', ''),
  ('e5555555-5555-5555-5555-555555555555', 'lisa.demo@skillshare.test', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now(), now(), '', '')
ON CONFLICT (id) DO NOTHING;

-- Profiles for the demo users
INSERT INTO public.profiles (id, email, first_name, last_name, bio, skills, rating_avg, credits_balance, role)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'maria.demo@skillshare.test', 'Maria', 'Schmidt', 'DIY enthusiast, love fixing things around the house', ARRAY['plumbing', 'general'], 4.5, 8, 'both'),
  ('b2222222-2222-2222-2222-222222222222', 'thomas.demo@skillshare.test', 'Thomas', 'Weber', 'Retired electrician with 30 years of experience', ARRAY['electrical', 'heating'], 4.8, 15, 'both'),
  ('c3333333-3333-3333-3333-333333333333', 'sarah.demo@skillshare.test', 'Sarah', 'Chen', 'First-time homeowner learning as I go', ARRAY['general'], 3.9, 5, 'seeker'),
  ('d4444444-4444-4444-4444-444444444444', 'james.demo@skillshare.test', 'James', 'Murphy', 'Appliance repair tech, happy to help', ARRAY['appliances', 'electrical'], 4.7, 20, 'giver'),
  ('e5555555-5555-5555-5555-555555555555', 'lisa.demo@skillshare.test', 'Lisa', 'Braun', 'Plumber by trade, homeowner by heart', ARRAY['plumbing', 'heating'], 4.2, 12, 'both')
ON CONFLICT (id) DO NOTHING;

-- Example posts with placeholder images from picsum.photos
INSERT INTO public.posts (id, user_id, title, description, category, urgency, images, status, created_at)
VALUES
  (
    'a0000001-0000-0000-0000-000000000001',
    'a1111111-1111-1111-1111-111111111111',
    'Kitchen faucet leaking non-stop',
    'My kitchen faucet has been dripping constantly for the past 3 days. I''ve tried tightening the handle but it didn''t help. The leak seems to come from under the spout when I turn the water on. It''s a single-handle Moen faucet, about 5 years old. Water is pooling under the sink and I''m worried about water damage.',
    'plumbing',
    'high',
    ARRAY[
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop'
    ],
    'open',
    now() - interval '2 hours'
  ),
  (
    'a0000002-0000-0000-0000-000000000002',
    'c3333333-3333-3333-3333-333333333333',
    'Wall outlet sparking when plugging in',
    'One of the outlets in my living room sparks every time I plug something in. It''s a two-prong outlet (older house). No breaker trips but I''m nervous about fire risk. The outlet plate feels slightly warm to the touch. Should I stop using it entirely? Need someone to walk me through checking if this is dangerous.',
    'electrical',
    'high',
    ARRAY[
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop'
    ],
    'open',
    now() - interval '5 hours'
  ),
  (
    'a0000003-0000-0000-0000-000000000003',
    'e5555555-5555-5555-5555-555555555555',
    'Washing machine won''t drain properly',
    'My LG front-load washer is leaving clothes soaking wet after the spin cycle. I can hear the motor running but water isn''t draining. I checked the lint filter and it was clean. Tried running a drain-only cycle and it just sits there humming. Machine is about 3 years old, still under extended warranty but I''d rather fix it myself if it''s simple.',
    'appliances',
    'medium',
    ARRAY[
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&h=400&fit=crop'
    ],
    'open',
    now() - interval '1 day'
  ),
  (
    'a0000004-0000-0000-0000-000000000004',
    'b2222222-2222-2222-2222-222222222222',
    'Radiator not heating up in bedroom',
    'The radiator in our bedroom stays cold while all others in the house work fine. I''ve tried bleeding it and a tiny bit of air came out, but it''s still cold after 24 hours. The valve seems to be open. The boiler is working because every other room is warm. Could it be a stuck valve or something more serious?',
    'heating',
    'medium',
    ARRAY[
      'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&h=400&fit=crop'
    ],
    'open',
    now() - interval '3 hours'
  ),
  (
    'a0000005-0000-0000-0000-000000000005',
    'a1111111-1111-1111-1111-111111111111',
    'Need help installing a ceiling fan',
    'I bought a ceiling fan to replace the light fixture in my living room. There''s already a junction box in the ceiling but I''m not sure if it''s rated for a fan. I have the fan, all the parts, and basic tools. Never done electrical work before and don''t want to mess it up. Would love someone to walk me through it step by step.',
    'electrical',
    'low',
    ARRAY[
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop'
    ],
    'open',
    now() - interval '2 days'
  ),
  (
    'a0000006-0000-0000-0000-000000000006',
    'c3333333-3333-3333-3333-333333333333',
    'Toilet keeps running after flush',
    'My toilet constantly runs after flushing. I have to jiggle the handle to make it stop. Looked inside the tank and the flapper looks old and warped. Is this an easy fix? I''ve never replaced any toilet parts before. Water bill is going to be insane if I don''t fix this soon.',
    'plumbing',
    'medium',
    ARRAY[
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop'
    ],
    'open',
    now() - interval '8 hours'
  ),
  (
    'a0000007-0000-0000-0000-000000000007',
    'd4444444-4444-4444-4444-444444444444',
    'Dishwasher leaving dishes dirty',
    'My Bosch dishwasher isn''t cleaning properly anymore. Dishes come out with food residue, especially on the top rack. I''ve cleaned the filter and spray arms. Tried different detergents. Water temperature seems okay. Maybe the spray arm is clogged? It''s about 4 years old and worked perfectly until last month.',
    'appliances',
    'low',
    ARRAY[
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=400&fit=crop'
    ],
    'open',
    now() - interval '1 day 4 hours'
  ),
  (
    'a0000008-0000-0000-0000-000000000008',
    'e5555555-5555-5555-5555-555555555555',
    'Squeaky door hinges throughout the house',
    'Every door in my house squeaks. It''s driving me crazy. I know WD-40 exists but I heard it''s not actually the best solution for door hinges. What should I use? And is there a proper technique to lubricate them? Some hinges look rusty too — should I replace those entirely?',
    'general',
    'low',
    ARRAY[
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop'
    ],
    'open',
    now() - interval '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Add time slots for each post (next 7 days)
INSERT INTO public.time_slots (post_id, date, start_time, end_time, status)
VALUES
  ('a0000001-0000-0000-0000-000000000001', CURRENT_DATE + 1, '09:00', '11:00', 'available'),
  ('a0000001-0000-0000-0000-000000000001', CURRENT_DATE + 1, '14:00', '16:00', 'available'),
  ('a0000001-0000-0000-0000-000000000001', CURRENT_DATE + 2, '10:00', '12:00', 'available'),
  ('a0000002-0000-0000-0000-000000000002', CURRENT_DATE + 1, '18:00', '20:00', 'available'),
  ('a0000002-0000-0000-0000-000000000002', CURRENT_DATE + 3, '09:00', '12:00', 'available'),
  ('a0000003-0000-0000-0000-000000000003', CURRENT_DATE + 2, '10:00', '13:00', 'available'),
  ('a0000003-0000-0000-0000-000000000003', CURRENT_DATE + 4, '15:00', '18:00', 'available'),
  ('a0000004-0000-0000-0000-000000000004', CURRENT_DATE + 1, '08:00', '10:00', 'available'),
  ('a0000004-0000-0000-0000-000000000004', CURRENT_DATE + 2, '17:00', '19:00', 'available'),
  ('a0000005-0000-0000-0000-000000000005', CURRENT_DATE + 3, '10:00', '14:00', 'available'),
  ('a0000005-0000-0000-0000-000000000005', CURRENT_DATE + 5, '09:00', '12:00', 'available'),
  ('a0000006-0000-0000-0000-000000000006', CURRENT_DATE + 1, '11:00', '13:00', 'available'),
  ('a0000006-0000-0000-0000-000000000006', CURRENT_DATE + 2, '14:00', '17:00', 'available'),
  ('a0000007-0000-0000-0000-000000000007', CURRENT_DATE + 3, '09:00', '11:00', 'available'),
  ('a0000007-0000-0000-0000-000000000007', CURRENT_DATE + 6, '13:00', '16:00', 'available'),
  ('a0000008-0000-0000-0000-000000000008', CURRENT_DATE + 2, '10:00', '12:00', 'available'),
  ('a0000008-0000-0000-0000-000000000008', CURRENT_DATE + 4, '16:00', '18:00', 'available')
ON CONFLICT DO NOTHING;
