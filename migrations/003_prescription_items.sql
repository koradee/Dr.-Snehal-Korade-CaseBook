-- Migration 003: prescription_items table
-- Line items for each drug prescribed in a consultation

CREATE TABLE IF NOT EXISTS prescription_items (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id  UUID  NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  drug_name        TEXT  NOT NULL,
  dosage           TEXT,
  frequency        TEXT,
  duration         TEXT,
  instructions     TEXT,
  sort_order       INT   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_prescription_consultation ON prescription_items (consultation_id);
