-- Migration 006: drug_library table
-- Quick-fill drug library for prescription autocomplete

CREATE TABLE IF NOT EXISTS drug_library (
  id                UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name         TEXT  NOT NULL UNIQUE,
  default_dosage    TEXT,
  default_frequency TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drug_library_name ON drug_library (drug_name text_pattern_ops);

-- Seed with common drugs for initial use
INSERT INTO drug_library (drug_name, default_dosage, default_frequency) VALUES
  ('Paracetamol', '500 mg', 'TDS'),
  ('Ibuprofen', '400 mg', 'BD'),
  ('Amoxicillin', '500 mg', 'TDS'),
  ('Azithromycin', '500 mg', 'OD'),
  ('Pantoprazole', '40 mg', 'OD before food'),
  ('Metformin', '500 mg', 'BD with food'),
  ('Amlodipine', '5 mg', 'OD'),
  ('Atorvastatin', '10 mg', 'OD at night'),
  ('Cetirizine', '10 mg', 'OD at night'),
  ('Montelukast', '10 mg', 'OD at night'),
  ('Salbutamol', '2 puffs', 'BD'),
  ('Prednisolone', '10 mg', 'OD morning'),
  ('Doxycycline', '100 mg', 'BD'),
  ('Ranitidine', '150 mg', 'BD'),
  ('Omeprazole', '20 mg', 'OD before food'),
  ('Domperidone', '10 mg', 'TDS before food'),
  ('Ondansetron', '4 mg', 'TDS'),
  ('Metronidazole', '400 mg', 'TDS'),
  ('Ciprofloxacin', '500 mg', 'BD'),
  ('Vitamin D3', '60000 IU', 'Once a week')
ON CONFLICT (drug_name) DO NOTHING;
