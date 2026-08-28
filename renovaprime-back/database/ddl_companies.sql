-- B2B: cadastro de empresas (fase 01)
-- Executar manualmente no banco (migrate.js não cria tabelas).

CREATE TABLE IF NOT EXISTS `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `legal_name` varchar(255) NOT NULL,
  `trade_name` varchar(255) NOT NULL,
  `cnpj` varchar(14) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `zip_code` varchar(8) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(2) NOT NULL,
  `state_registration` varchar(50) DEFAULT NULL,
  `responsible_name` varchar(255) NOT NULL,
  `responsible_email` varchar(255) NOT NULL,
  `responsible_phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `asaas_customer_id` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_companies_cnpj` (`cnpj`),
  UNIQUE KEY `uq_companies_responsible_email` (`responsible_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
