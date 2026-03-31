-- ============================================
-- SKILLSHARE — Reset & Re-seed (run in SQL Editor)
-- Deletes old demo data and creates fresh data
-- ============================================

-- Clean up old demo posts and profiles
DELETE FROM public.posts WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.profiles WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM auth.users WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

-- ============================================
-- CREATE DEMO USERS
-- ============================================

INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, raw_user_meta_data)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'maria.schmidt@demo.skillshare.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now() - interval '45 days', now(), '', '', '{"first_name": "Maria", "last_name": "Schmidt"}'::jsonb),
  ('b2222222-2222-2222-2222-222222222222', 'thomas.weber@demo.skillshare.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now() - interval '30 days', now(), '', '', '{"first_name": "Thomas", "last_name": "Weber"}'::jsonb),
  ('c3333333-3333-3333-3333-333333333333', 'sarah.chen@demo.skillshare.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now() - interval '20 days', now(), '', '', '{"first_name": "Sarah", "last_name": "Chen"}'::jsonb),
  ('d4444444-4444-4444-4444-444444444444', 'james.murphy@demo.skillshare.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now() - interval '60 days', now(), '', '', '{"first_name": "James", "last_name": "Murphy"}'::jsonb),
  ('e5555555-5555-5555-5555-555555555555', 'lisa.braun@demo.skillshare.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('demo12345', gen_salt('bf')), now(), now() - interval '15 days', now(), '', '', '{"first_name": "Lisa", "last_name": "Braun"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CREATE PROFILES WITH NAMES
-- ============================================

INSERT INTO public.profiles (id, email, first_name, last_name, bio, skills, rating_avg, credits_balance, role, created_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'maria.schmidt@demo.skillshare.com', 'Maria', 'Schmidt', 'DIY enthusiast and weekend warrior. Love tackling home projects!', ARRAY['plumbing', 'general'], 4.5, 8, 'both', now() - interval '45 days'),
  ('b2222222-2222-2222-2222-222222222222', 'thomas.weber@demo.skillshare.com', 'Thomas', 'Weber', 'Retired electrician, 30 years experience. Happy to help anyone.', ARRAY['electrical', 'heating'], 4.8, 15, 'both', now() - interval '30 days'),
  ('c3333333-3333-3333-3333-333333333333', 'sarah.chen@demo.skillshare.com', 'Sarah', 'Chen', 'First-time homeowner, learning everything from scratch!', ARRAY['general'], 3.9, 5, 'seeker', now() - interval '20 days'),
  ('d4444444-4444-4444-4444-444444444444', 'james.murphy@demo.skillshare.com', 'James', 'Murphy', 'Appliance repair technician. If it has a motor, I can fix it.', ARRAY['appliances', 'electrical'], 4.7, 20, 'giver', now() - interval '60 days'),
  ('e5555555-5555-5555-5555-555555555555', 'lisa.braun@demo.skillshare.com', 'Lisa', 'Braun', 'Licensed plumber and heating specialist. Ask me anything!', ARRAY['plumbing', 'heating'], 4.2, 12, 'both', now() - interval '15 days')
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  bio = EXCLUDED.bio,
  skills = EXCLUDED.skills,
  rating_avg = EXCLUDED.rating_avg,
  credits_balance = EXCLUDED.credits_balance,
  role = EXCLUDED.role;

-- ============================================
-- CREATE EXAMPLE POSTS
-- ============================================

INSERT INTO public.posts (id, user_id, title, description, category, urgency, images, status, created_at)
VALUES
  (
    'a0000001-0000-0000-0000-000000000001',
    'a1111111-1111-1111-1111-111111111111',
    'Kitchen faucet leaking non-stop',
    'My kitchen faucet has been dripping constantly for 3 days. Tried tightening the handle but it didn''t help. The leak comes from under the spout when I turn the water on. It''s a single-handle Moen faucet, about 5 years old. Water is pooling under the sink — worried about water damage.',
    'plumbing',
    'high',
    ARRAY['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop'],
    'open',
    now() - interval '2 hours'
  ),
  (
    'a0000002-0000-0000-0000-000000000002',
    'c3333333-3333-3333-3333-333333333333',
    'Wall outlet sparking when plugging in',
    'One of my living room outlets sparks every time I plug something in. It''s an older two-prong outlet. No breaker trips but I''m worried about fire risk. The outlet plate feels slightly warm to the touch. Should I stop using it? Need someone to walk me through checking this.',
    'electrical',
    'high',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop'],
    'open',
    now() - interval '5 hours'
  ),
  (
    'a0000003-0000-0000-0000-000000000003',
    'e5555555-5555-5555-5555-555555555555',
    'Washing machine won''t drain properly',
    'My LG front-load washer leaves clothes soaking wet after the spin cycle. Motor is running but water isn''t draining. Checked the lint filter — clean. Tried a drain-only cycle and it just hums. Machine is 3 years old. Would rather fix it myself if it''s simple.',
    'appliances',
    'medium',
    ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&h=400&fit=crop'],
    'open',
    now() - interval '1 day'
  ),
  (
    'a0000004-0000-0000-0000-000000000004',
    'b2222222-2222-2222-2222-222222222222',
    'Radiator not heating up in bedroom',
    'The bedroom radiator stays cold while all others work fine. Tried bleeding it — a tiny bit of air came out but still cold after 24 hours. Valve seems open. Boiler is working because every other room is warm. Could it be a stuck valve?',
    'heating',
    'medium',
    ARRAY['https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&h=400&fit=crop'],
    'open',
    now() - interval '3 hours'
  ),
  (
    'a0000005-0000-0000-0000-000000000005',
    'a1111111-1111-1111-1111-111111111111',
    'Need help installing a ceiling fan',
    'Bought a ceiling fan to replace my living room light fixture. There''s a junction box in the ceiling but not sure if it''s rated for a fan. I have the fan, all parts, and basic tools. Never done electrical work before — would love step-by-step guidance.',
    'electrical',
    'low',
    ARRAY['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop'],
    'open',
    now() - interval '2 days'
  ),
  (
    'a0000006-0000-0000-0000-000000000006',
    'c3333333-3333-3333-3333-333333333333',
    'Toilet keeps running after flush',
    'My toilet constantly runs after flushing. Have to jiggle the handle to stop it. Looked inside the tank — flapper looks old and warped. Is this an easy fix? Never replaced toilet parts before. Water bill is going to be insane if I don''t fix this.',
    'plumbing',
    'medium',
    ARRAY['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop'],
    'open',
    now() - interval '8 hours'
  ),
  (
    'a0000007-0000-0000-0000-000000000007',
    'd4444444-4444-4444-4444-444444444444',
    'Dishwasher leaving dishes dirty',
    'My Bosch dishwasher isn''t cleaning properly anymore. Dishes come out with food residue, especially top rack. Cleaned the filter and spray arms. Tried different detergents. Water temperature seems fine. Worked perfectly until last month.',
    'appliances',
    'low',
    ARRAY['https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=400&fit=crop'],
    'open',
    now() - interval '1 day 4 hours'
  ),
  (
    'a0000008-0000-0000-0000-000000000008',
    'e5555555-5555-5555-5555-555555555555',
    'Squeaky door hinges throughout the house',
    'Every door in my house squeaks and it''s driving me crazy. I heard WD-40 isn''t actually the best for hinges. What should I use instead? Some hinges look rusty — should I replace those entirely? Looking for the proper technique.',
    'general',
    'low',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop'],
    'open',
    now() - interval '3 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  urgency = EXCLUDED.urgency,
  images = EXCLUDED.images,
  status = EXCLUDED.status;

-- ============================================
-- TIME SLOTS (next 7 days)
-- ============================================

-- Delete old time slots for these posts first
DELETE FROM public.time_slots WHERE post_id IN (
  'a0000001-0000-0000-0000-000000000001',
  'a0000002-0000-0000-0000-000000000002',
  'a0000003-0000-0000-0000-000000000003',
  'a0000004-0000-0000-0000-000000000004',
  'a0000005-0000-0000-0000-000000000005',
  'a0000006-0000-0000-0000-000000000006',
  'a0000007-0000-0000-0000-000000000007',
  'a0000008-0000-0000-0000-000000000008'
);

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
  ('a0000008-0000-0000-0000-000000000008', CURRENT_DATE + 4, '16:00', '18:00', 'available');
