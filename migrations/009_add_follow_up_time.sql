-- Migration 009: Add follow_up_time to consultations
-- Allows for time-sorted follow-ups on the dashboard

ALTER TABLE consultations
ADD COLUMN follow_up_time TIME;
