# Sistema de Jobs Cron - Inativação de Beneficiários

Este sistema gerencia a inativação automática de beneficiários de planos individuais após 24 horas.

## 📋 Funcionalidade

O sistema executa automaticamente **a cada 2 horas** e verifica:
- Vendas com `tipo = 'plano_individual'`
- Criadas há mais de 24 horas
- Que ainda não foram processadas (`processado IS NULL`)
- Que possuem UUID válido

Para cada venda encontrada, o sistema:
1. Inativa o beneficiário através da API
2. Marca a venda como processada na base de dados
3. Registra logs detalhados do processo

## 🗄️ Estrutura do Banco de Dados

### Colunas Adicionadas na Tabela `venda`

```sql
-- Controla se a venda foi processada pelo job
processado CHAR(1) DEFAULT NULL 
-- 'S' = Processado com sucesso
-- 'N' = Falha no processamento  
-- NULL = Não processado

-- Data e hora do processamento
data_processamento DATETIME DEFAULT NULL
```

### Índice para Performance
```sql
CREATE INDEX idx_venda_tipo_processado_data ON venda (tipo, processado, data_hora);
```

## 🔧 Configuração

### 1. Executar Migração do Banco
```bash
# Execute o script SQL uma única vez
mysql -u usuario -p database < database/migrations/add_processado_columns_to_venda.sql
```

### 2. Instalar Dependência
```bash
npm install node-cron
```

### 3. Inicialização Automática
O sistema é inicializado automaticamente quando o servidor Node.js inicia.

## 🚀 Uso Manual (Para Testes)

### Executar Job Manualmente
```bash
POST /api/admin/run-deactivation-job
```

**Resposta:**
```json
{
  "success": true,
  "message": "Deactivation job executed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Verificar Status das Inativações
```bash
GET /api/admin/pending-deactivations
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "pending": {
      "ready_for_deactivation": [], // Vendas prontas para inativação (>24h)
      "waiting_for_expiration": []  // Vendas aguardando expiração (<24h)
    },
    "recently_processed": [],       // Vendas processadas nas últimas 24h
    "summary": {
      "total_pending": 0,
      "ready_for_deactivation": 0,
      "waiting_for_expiration": 0,
      "recently_processed": 0
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📊 Logs e Monitoramento

O sistema gera logs detalhados:

```
=== Starting expired individual plans deactivation job ===
Timestamp: 2024-01-15T10:00:00.000Z
Found 2 expired individual plan(s) to process:

Processing sale ID: 123, UUID: abc-def-123, CPF: 12345678901
Sale created at: 2024-01-14T09:00:00.000Z
Attempting to deactivate beneficiary with UUID: abc-def-123
Successfully deactivated beneficiary: abc-def-123
Sale 123 marked as processed: SUCCESS

=== Expired individual plans deactivation job completed ===
```

## ⏰ Agendamento

- **Frequência**: A cada 2 horas
- **Cron Expression**: `0 */2 * * *`
- **Timezone**: America/Sao_Paulo
- **Início**: Automático quando o servidor inicia

## 🔒 Segurança

- Jobs só são executados para planos individuais
- Cada venda é processada apenas uma vez
- Sistema resiliente a falhas na API externa
- Logs detalhados para auditoria
- Pausa de 1 segundo entre requisições para não sobrecarregar a API

## 🛠️ Manutenção

### Reprocessar Vendas com Falha
Para reprocessar vendas que falharam:

```sql
UPDATE venda 
SET processado = NULL, data_processamento = NULL 
WHERE processado = 'N' AND tipo = 'plano_individual';
```

### Verificar Status Geral
```sql
SELECT 
  processado,
  COUNT(*) as total,
  MIN(data_hora) as primeira_venda,
  MAX(data_hora) as ultima_venda
FROM venda 
WHERE tipo = 'plano_individual'
GROUP BY processado;
```

## 📁 Estrutura de Arquivos

```
src/jobs/
├── index.js                    # Inicializador de todos os jobs
├── deactivateBeneficiaries.js  # Job principal de inativação
└── README.md                   # Esta documentação
``` 