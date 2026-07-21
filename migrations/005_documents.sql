-- Migration 005: documents table
-- Lab reports, scans, and other documents attached to patients/consultations

CREATE TABLE IF NOT EXISTS documents (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id  UUID        REFERENCES consultations(id) ON DELETE SET NULL,
  type             TEXT        NOT NULL CHECK (type IN ('lab_report', 'scan', 'other')),
  file_url         TEXT        NOT NULL,
  file_name        TEXT,
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_patient_id      ON documents (patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_consultation_id ON documents (consultation_id) WHERE consultation_id IS NOT NULL;
