-- Migration 004: clinical_images table
-- Images captured during/after a consultation, stored in S3

CREATE TABLE IF NOT EXISTS clinical_images (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id  UUID        NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  image_url        TEXT        NOT NULL,
  caption          TEXT,
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_images_consultation ON clinical_images (consultation_id);
