-- Adicionar coluna user_id à tabela beneficiaries
ALTER TABLE beneficiaries
ADD COLUMN user_id INT NULL AFTER id,
ADD UNIQUE KEY uq_beneficiaries_user_id (user_id),
ADD CONSTRAINT fk_beneficiaries_user_id FOREIGN KEY (user_id) REFERENCES users(id);
