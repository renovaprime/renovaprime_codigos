-- B2B fase 04: faturamento mensal e webhook ASAAS
-- Executar manualmente no banco (migrate.js não cria tabelas).

CREATE TABLE IF NOT EXISTS `company_billings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `competence` varchar(7) NOT NULL COMMENT 'YYYY-MM',
  `billing_type` enum('PER_LIFE','PER_FAMILY') NOT NULL,
  `total_lives` int NOT NULL,
  `total_families` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `asaas_payment_id` varchar(100) DEFAULT NULL,
  `asaas_invoice_url` varchar(500) DEFAULT NULL,
  `status` enum('PENDING','ISSUED','PAID','OVERDUE','CANCELED','ERROR') NOT NULL DEFAULT 'PENDING',
  `error_message` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_billings_competence` (`company_id`,`competence`),
  KEY `idx_company_billings_company` (`company_id`),
  KEY `idx_company_billings_asaas_payment` (`asaas_payment_id`),
  CONSTRAINT `fk_company_billings_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `company_billing_webhook_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` varchar(100) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `gateway` varchar(50) NOT NULL DEFAULT 'asaas',
  `payload` json NOT NULL,
  `company_billing_id` int DEFAULT NULL,
  `processed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_billing_webhook_event_id` (`event_id`),
  KEY `idx_company_billing_webhook_billing` (`company_billing_id`),
  CONSTRAINT `fk_company_billing_webhook_billing` FOREIGN KEY (`company_billing_id`) REFERENCES `company_billings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
