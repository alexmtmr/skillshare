-- ============================================
-- SKILLSHARE — Migration: Split name into first_name + last_name
-- Run this in the Supabase SQL Editor
-- ============================================

-- Step 1: Add new columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '';

-- Step 2: Migrate existing data (split on first space)
UPDATE public.profiles
SET
  first_name = CASE
    WHEN position(' ' in name) > 0 THEN left(name, position(' ' in name) - 1)
    ELSE name
  END,
  last_name = CASE
    WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
    ELSE ''
  END
WHERE first_name = '' AND name != '';

-- Step 3: Update the handle_new_user trigger to use first_name/last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, credits_balance)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    10
  );
  -- Log the signup bonus transaction
  INSERT INTO public.transactions (user_id, type, amount, description)
  VALUES (new.id, 'earn', 10, 'Welcome bonus');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4 (optional): Drop old name column after verifying everything works
-- ALTER TABLE public.profiles DROP COLUMN name;
-- NOTE: Only run this AFTER confirming the app works with first_name/last_name
