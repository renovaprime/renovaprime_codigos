-- Migration: Add memed_patient_link and memed_patient_digits to prescriptions
-- Date: 2026-03-19
-- Description: Columns to cache the Memed digital prescription link and unlock code for patients

ALTER TABLE prescriptions
ADD COLUMN memed_patient_link VARCHAR(500) NULL;

ALTER TABLE prescriptions
ADD COLUMN memed_patient_digits VARCHAR(10) NULL;
