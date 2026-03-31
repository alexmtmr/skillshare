-- ============================================
-- SKILLSHARE — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. PROFILES
-- Extends Supabase auth.users with app-specific data
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null default '',
  avatar_url text,
  bio text,
  skills text[] default '{}',
  rating_avg numeric(3,2) default 0,
  credits_balance integer default 10,
  role text default 'both' check (role in ('seeker', 'giver', 'both')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Anyone can view profiles (needed for showing giver/seeker info)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can insert their own profile (during registration)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2. POSTS (Problem Posts)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null check (category in ('plumbing', 'electrical', 'appliances', 'heating', 'general')),
  urgency text not null default 'low' check (urgency in ('low', 'medium', 'high')),
  images text[] default '{}',
  status text default 'open' check (status in ('open', 'matched', 'completed', 'closed')),
  created_at timestamptz default now()
);

alter table public.posts enable row level security;

-- Anyone authenticated can view open posts
create policy "Open posts are viewable by authenticated users"
  on public.posts for select
  using (auth.role() = 'authenticated');

-- Users can create their own posts
create policy "Users can create own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Users can update their own posts
create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id);

-- Users can delete their own posts
create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);


-- 3. TIME SLOTS
create table public.time_slots (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'available' check (status in ('available', 'booked')),
  constraint valid_time_range check (end_time > start_time)
);

alter table public.time_slots enable row level security;

-- Authenticated users can view time slots
create policy "Time slots viewable by authenticated users"
  on public.time_slots for select
  using (auth.role() = 'authenticated');

-- Post owner can manage time slots
create policy "Post owner can insert time slots"
  on public.time_slots for insert
  with check (
    auth.uid() = (select user_id from public.posts where id = post_id)
  );

create policy "Post owner can update time slots"
  on public.time_slots for update
  using (
    auth.uid() = (select user_id from public.posts where id = post_id)
  );


-- 4. SESSIONS
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  seeker_id uuid references public.profiles(id) not null,
  giver_id uuid references public.profiles(id) not null,
  timeslot_id uuid references public.time_slots(id) not null,
  status text default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  max_duration integer default 30,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

alter table public.sessions enable row level security;

-- Session participants can view their sessions
create policy "Session participants can view sessions"
  on public.sessions for select
  using (auth.uid() = seeker_id or auth.uid() = giver_id);

-- Authenticated users can create sessions (connection flow)
create policy "Authenticated users can create sessions"
  on public.sessions for insert
  with check (auth.role() = 'authenticated');

-- Session participants can update sessions
create policy "Session participants can update sessions"
  on public.sessions for update
  using (auth.uid() = seeker_id or auth.uid() = giver_id);


-- 5. RATINGS
create table public.ratings (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  rater_id uuid references public.profiles(id) not null,
  rated_id uuid references public.profiles(id) not null,
  stars integer not null check (stars >= 1 and stars <= 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.ratings enable row level security;

-- Anyone can view ratings (public reputation)
create policy "Ratings are viewable by everyone"
  on public.ratings for select
  using (true);

-- Session participants can create ratings
create policy "Session participants can create ratings"
  on public.ratings for insert
  with check (
    auth.uid() = rater_id
    and exists (
      select 1 from public.sessions
      where id = session_id
      and (seeker_id = auth.uid() or giver_id = auth.uid())
      and status = 'completed'
    )
  );


-- 6. TRANSACTIONS (Credit ledger)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('earn', 'spend', 'purchase', 'penalty', 'refund')),
  amount integer not null,
  description text not null,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

-- Users can view their own transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- System inserts transactions (via service role or server actions)
create policy "Authenticated users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);


-- 7. NOTIFICATIONS
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in (
    'connection_request', 'session_confirmed', 'session_reminder',
    'rating_received', 'credits_earned', 'credits_purchased'
  )),
  title text not null,
  message text not null,
  read boolean default false,
  data jsonb,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

-- Users can view their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- System can insert notifications
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (true);


-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, credits_balance)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    10
  );
  -- Log the signup bonus transaction
  insert into public.transactions (user_id, type, amount, description)
  values (new.id, 'earn', 10, 'Welcome bonus');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Recalculate average rating for a user after a new rating is inserted
create or replace function public.update_rating_avg()
returns trigger as $$
begin
  update public.profiles
  set rating_avg = (
    select coalesce(avg(stars), 0)
    from public.ratings
    where rated_id = new.rated_id
  )
  where id = new.rated_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_rating_created
  after insert on public.ratings
  for each row execute procedure public.update_rating_avg();
