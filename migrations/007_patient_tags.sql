-- Migration 007: patient_tags table
-- Flexible tagging for patients (e.g., "Diabetic", "Hypertensive", "Pediatric")

CREATE TABLE IF NOT EXISTS patient_tags (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID  NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tag_name   TEXT  NOT NULL,
  UNIQUE (patient_id, tag_name)
);

CREATE INDEX IF NOT EXISTS idx_patient_tags_patient_id ON patient_tags (patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_tags_tag_name   ON patient_tags (tag_name);
