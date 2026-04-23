-- ============================================================
-- Leaf Cleaning Sales Tracker — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT DEFAULT 'rep' CHECK (role IN ('rep', 'manager', 'admin')),
  avatar_color TEXT DEFAULT '#6BAF6B',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Daily sessions — tracks doors knocked per rep per day
CREATE TABLE sales_sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  doors_knocked INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rep_id, session_date)
);

-- Individual sales
CREATE TABLE sales (
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

-- Profiles: anyone can read all profiles (for leaderboard); only own profile can be updated
CREATE POLICY "profiles_select_all"  ON profiles FOR SELECT  USING (true);
CREATE POLICY "profiles_insert_own"  ON profiles FOR INSERT  WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON profiles FOR UPDATE  USING (auth.uid() = id);

-- Sessions: anyone can read (for leaderboard); only own sessions can be inserted/updated
CREATE POLICY "sessions_select_all"  ON sales_sessions FOR SELECT USING (true);
CREATE POLICY "sessions_insert_own"  ON sales_sessions FOR INSERT WITH CHECK (auth.uid() = rep_id);
CREATE POLICY "sessions_update_own"  ON sales_sessions FOR UPDATE USING (auth.uid() = rep_id);

-- Sales: anyone can read (for leaderboard); only own sales can be inserted/deleted
CREATE POLICY "sales_select_all"     ON sales FOR SELECT USING (true);
CREATE POLICY "sales_insert_own"     ON sales FOR INSERT WITH CHECK (auth.uid() = rep_id);
CREATE POLICY "sales_delete_own"     ON sales FOR DELETE USING (auth.uid() = rep_id);

-- ============================================================
-- Auto-create profile on signup
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Useful views
-- ============================================================

-- Weekly rep performance view
CREATE OR REPLACE VIEW weekly_rep_stats AS
SELECT
  p.id AS rep_id,
  p.name,
  p.avatar_color,
  COUNT(DISTINCT s.id)           AS total_sales,
  COALESCE(SUM(s.amount), 0)     AS total_revenue,
  COALESCE(SUM(ss.doors_knocked), 0) AS total_doors,
  CASE WHEN COALESCE(SUM(ss.doors_knocked), 0) > 0
    THEN ROUND(COUNT(DISTINCT s.id)::NUMERIC / SUM(ss.doors_knocked) * 100, 1)
    ELSE 0
  END AS close_rate_pct
FROM profiles p
LEFT JOIN sales s ON s.rep_id = p.id
  AND s.sale_date >= date_trunc('week', CURRENT_DATE)
  AND s.sale_date <= CURRENT_DATE
LEFT JOIN sales_sessions ss ON ss.rep_id = p.id
  AND ss.session_date >= date_trunc('week', CURRENT_DATE)
  AND ss.session_date <= CURRENT_DATE
GROUP BY p.id, p.name, p.avatar_color
ORDER BY total_revenue DESC;
