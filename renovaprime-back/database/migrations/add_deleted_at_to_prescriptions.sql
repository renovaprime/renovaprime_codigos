-- Migration: Add deleted_at to prescriptions
-- Date: 2026-04-07
-- Description: Column to mark prescriptions as deleted (soft delete) for MEMED compliance

ALTER TABLE prescriptions
ADD COLUMN deleted_at DATETIME NULL;
