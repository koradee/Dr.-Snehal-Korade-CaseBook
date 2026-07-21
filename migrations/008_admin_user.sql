-- Migration 008: admin_user table + migration tracking
-- Single-user admin account for Dr. Snehal Korade

CREATE TABLE IF NOT EXISTS admin_user (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username        TEXT        NOT NULL UNIQUE,
  password_hash   TEXT        NOT NULL,
  display_name    TEXT        NOT NULL DEFAULT 'Dr. Snehal Korade',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ
);

-- Migration tracking table (managed by migration runner)
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     TEXT        PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the admin user
-- Default password: Doctor@2024 (CHANGE THIS — update ADMIN_PASSWORD env var and re-hash)
-- Hash generated with: bcrypt.hashSync('Doctor@2024', 12)
-- The actual hash is set via the ADMIN_PASSWORD_HASH environment variable at migration time.
-- This INSERT is intentionally left as a placeholder; the migration runner fills it in.
-- See scripts/migrate.ts for implementation.
