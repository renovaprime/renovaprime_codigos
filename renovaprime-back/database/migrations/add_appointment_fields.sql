-- Migration: Adicionar campos type, updated_at e beneficiary_id em appointments
-- Data: 2026-01-16

-- Adicionar tipo de consulta (online/presencial)
ALTER TABLE appointments 
ADD COLUMN type ENUM('ONLINE','PRESENTIAL') NOT NULL DEFAULT 'ONLINE';

-- Adicionar updated_at
ALTER TABLE appointments 
ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Adicionar referência ao beneficiário (mantém patient_id para retrocompatibilidade)
ALTER TABLE appointments 
ADD COLUMN beneficiary_id INT NULL,
ADD CONSTRAINT fk_appointments_beneficiary 
FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id);

-- Adicionar índice para consultas do beneficiário
CREATE INDEX idx_appointments_beneficiary_date ON appointments(beneficiary_id, date);
