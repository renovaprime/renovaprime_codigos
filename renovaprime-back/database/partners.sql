
CREATE TABLE `partners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `bank_agency` varchar(50) DEFAULT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `bank_digit` varchar(10) DEFAULT NULL,
  `pix_key` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `logo_url` text DEFAULT NULL,
  `website_url` varchar(250) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_partners_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `partner_branches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `partner_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `alias` varchar(100) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_partner_branches_email` (`email`),
  KEY `idx_partner_branches_partner` (`partner_id`),
  CONSTRAINT `fk_partner_branches_partner`
    FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `resellers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `branch_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `pix_key` varchar(255) DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `functional_unit` varchar(25) DEFAULT NULL,
  `registration_code` varchar(25) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_resellers_cpf` (`cpf`),
  KEY `idx_resellers_branch` (`branch_id`),
  CONSTRAINT `fk_resellers_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `partner_branches` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
