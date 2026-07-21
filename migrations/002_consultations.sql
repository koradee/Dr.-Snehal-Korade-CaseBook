-- Migration 002: consultations table
-- Stores each visit/consultation record

CREATE TABLE IF NOT EXISTS consultations (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id             UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date             DATE        NOT NULL DEFAULT CURRENT_DATE,
  visit_type             TEXT        NOT NULL CHECK (visit_type IN ('new', 'follow_up')),
  vitals                 JSONB,
  -- vitals shape: { bp: string, pulse: number, temp: number, weight: number,
  --                 height: number, spo2: number, bmi: number }
  chief_complaint        TEXT,
  history                TEXT,
  examination_findings   TEXT,
  diagnosis              TEXT,
  advice                 TEXT,
  follow_up_date         DATE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id   ON consultations (patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_visit_date   ON consultations (visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_follow_up    ON consultations (follow_up_date) WHERE follow_up_date IS NOT NULL;
