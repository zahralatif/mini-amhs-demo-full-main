CREATE DATABASE amhs_demo;

\c amhs_demo;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  receiver_archived BOOLEAN NOT NULL DEFAULT FALSE,
  sender_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_created_at
  ON messages(receiver, created_at DESC);

-- Backfill for existing databases
-- Step 1: Add new columns if they don't exist
ALTER TABLE messages ADD COLUMN IF NOT EXISTS receiver_archived BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Step 2: Backfill data from old `is_archived` column if it exists.
-- This is a bit tricky to do idempotently in a simple script,
-- but for this demo, we assume we can run it once during migration.
DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_archived') THEN
        EXECUTE 'UPDATE messages SET receiver_archived = is_archived WHERE receiver_archived IS FALSE';
        -- We might choose to drop the old column after migration
        -- ALTER TABLE messages DROP COLUMN is_archived;
    END IF;
END $$;


ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;
