-- Adicionar colunas para controle de processamento na tabela venda
-- Execute este script apenas uma vez

-- Adicionar coluna para marcar se a venda foi processada pelo job de inativação
ALTER TABLE venda 
ADD COLUMN IF NOT EXISTS processado CHAR(1) DEFAULT NULL COMMENT 'S=Processado com sucesso, N=Falha no processamento, NULL=Não processado';

-- Adicionar coluna para data/hora do processamento
ALTER TABLE venda 
ADD COLUMN IF NOT EXISTS data_processamento DATETIME DEFAULT NULL COMMENT 'Data e hora do processamento da inativação';

-- Criar índice para melhorar performance das consultas do job
CREATE INDEX IF NOT EXISTS idx_venda_tipo_processado_data 
ON venda (tipo, processado, data_hora); 