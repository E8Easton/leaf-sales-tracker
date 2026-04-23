-- ============================================================
-- Leaf Cleaning Sales Tracker — Supabase Schema
-- STEP 1: Run this entire file in Supabase SQL Editor
-- STEP 2: Run messages_migration.sql
-- STEP 3: Sign up in the app, then run the admin promotion below
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT DEFAULT 'rep' CHECK (role IN ('rep', 'manager', 'admin')),
  avatar_color TEXT DEFAULT '#6BAF6B',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Daily sessions — tracks doors knocked per rep per day
CREATE TABLE IF NOT EXISTS sales_sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  doors_knocked INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rep_id, session_date)
);

-- Individual sales
CREATE TABLE IF NOT EXISTS sales (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id    UUID REFERENCES sales_sessions(id) ON DELETE SET NULL,
  sale_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  amount        DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  service_type  TEXT DEFAULT 'Window Cleaning'
                  CHECK (service_type IN ('Window Cleaning','Gutter Cleaning','Pressure Washing','Other')),
  customer_name TEXT,
  address       TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales           ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_select_all' AND tablename='profiles') THEN
    CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_insert_own' AND tablename='profiles') THEN
    CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_update_own' AND tablename='profiles') THEN
    CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Sessions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sessions_select_all' AND tablename='sales_sessions') THEN
    CREATE POLICY "sessions_select_all" ON sales_sessions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sessions_insert_own' AND tablename='sales_sessions') THEN
    CREATE POLICY "sessions_insert_own" ON sales_sessions FOR INSERT WITH CHECK (auth.uid() = rep_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sessions_update_own' AND tablename='sales_sessions') THEN
    CREATE POLICY "sessions_update_own" ON sales_sessions FOR UPDATE USING (auth.uid() = rep_id);
  END IF;

  -- Sales policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sales_select_all' AND tablename='sales') THEN
    CREATE POLICY "sales_select_all" ON sales FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sales_insert_own' AND tablename='sales') THEN
    CREATE POLICY "sales_insert_own" ON sales FOR INSERT WITH CHECK (auth.uid() = rep_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sales_delete_own' AND tablename='sales') THEN
    CREATE POLICY "sales_delete_own" ON sales FOR DELETE USING (auth.uid() = rep_id);
  END IF;
END $$;

-- ============================================================
-- Auto-create profile on signup trigger
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, role, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'rep',
    '#6BAF6B'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- STEP 3: After signing up in the app, promote yourself to admin.
-- Replace the email below with your actual email.
-- ============================================================
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'eastonzastrow@gmail.com');
