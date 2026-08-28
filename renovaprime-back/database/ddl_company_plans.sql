-- B2B fase 02: planos empresariais, faixas de preço e contratos
-- Executar manualmente no banco (migrate.js não cria tabelas).

CREATE TABLE IF NOT EXISTS `company_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `billing_type` enum('PER_LIFE','PER_FAMILY') NOT NULL,
  `service_type` enum('CLINICO','PREMIUM','FAMILIAR') NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `company_plan_price_tiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_plan_id` int NOT NULL,
  `lives_from` int NOT NULL,
  `lives_to` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_company_plan_price_tiers_plan` (`company_plan_id`),
  CONSTRAINT `fk_company_plan_price_tiers_plan` FOREIGN KEY (`company_plan_id`) REFERENCES `company_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `company_contracts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `company_plan_id` int NOT NULL,
  `billing_type` enum('PER_LIFE','PER_FAMILY') NOT NULL,
  `due_day` tinyint NOT NULL DEFAULT '5',
  `starts_on` date NOT NULL,
  `ends_on` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_company_contracts_company` (`company_id`),
  KEY `idx_company_contracts_plan` (`company_plan_id`),
  CONSTRAINT `fk_company_contracts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_company_contracts_plan` FOREIGN KEY (`company_plan_id`) REFERENCES `company_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
