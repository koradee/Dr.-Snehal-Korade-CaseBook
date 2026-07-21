-- Migration 010: Add prescription_text to consultations
-- Allows for free-text prescriptions before structured prescribing is added

ALTER TABLE consultations
ADD COLUMN prescription_text TEXT;
