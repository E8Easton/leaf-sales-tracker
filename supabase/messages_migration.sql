-- ============================================================
-- Messages table — run this AFTER schema.sql
-- ============================================================

CREATE TABLE messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Anyone involved in the message can read it
CREATE POLICY "messages_select_participant" ON messages
  FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);

-- Admins/managers can send messages; reps can reply
CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT WITH CHECK (auth.uid() = from_id);

-- Only recipient can mark as read (update read_at)
CREATE POLICY "messages_update_recipient" ON messages
  FOR UPDATE USING (auth.uid() = to_id);

-- Promote yourself to admin (run manually for the owner account):
-- UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
