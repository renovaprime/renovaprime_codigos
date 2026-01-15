-- Adicionar coluna telefone na tabela revendedor
-- Execute este script apenas uma vez

ALTER TABLE revendedor 
ADD COLUMN telefone VARCHAR(20) DEFAULT NULL COMMENT 'Telefone do revendedor' AFTER email; 