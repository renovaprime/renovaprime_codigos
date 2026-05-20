-- totalmedi.cms definition

CREATE TABLE `cms` (
  `key` varchar(100) NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.partners definition

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
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `logo_url` text,
  `website_url` varchar(250) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_partners_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.permissions definition

CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.prescriptions definition

CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `memed_prescription_id` int NOT NULL,
  `memed_uuid` varchar(50) NOT NULL,
  `memed_patient_id` int DEFAULT NULL,
  `signed` tinyint(1) DEFAULT '0',
  `memed_payload` json NOT NULL,
  `issued_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `memed_patient_link` varchar(500) DEFAULT NULL,
  `memed_patient_digits` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prescription_uuid` (`memed_uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.roles definition

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.specialties definition

CREATE TABLE `specialties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.partner_branches definition

CREATE TABLE `partner_branches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `partner_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `alias` varchar(100) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_partner_branches_email` (`email`),
  KEY `idx_partner_branches_partner` (`partner_id`),
  CONSTRAINT `fk_partner_branches_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.plan_commissions definition

CREATE TABLE `plan_commissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `partner_id` int NOT NULL,
  `plan_type` enum('CLINICO','PREMIUM','FAMILIAR') NOT NULL,
  `partner_pct` decimal(5,2) NOT NULL DEFAULT '0.00',
  `branch_pct` decimal(5,2) NOT NULL DEFAULT '0.00',
  `reseller_pct` decimal(5,2) NOT NULL DEFAULT '0.00',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plan_commissions_partner_plan` (`partner_id`,`plan_type`),
  CONSTRAINT `fk_plan_commissions_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.resellers definition

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
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_resellers_cpf` (`cpf`),
  KEY `idx_resellers_branch` (`branch_id`),
  CONSTRAINT `fk_resellers_branch` FOREIGN KEY (`branch_id`) REFERENCES `partner_branches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.role_permissions definition

CREATE TABLE `role_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_permission` (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.users definition

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `status` enum('ACTIVE','PENDING','BLOCKED') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cpf` varchar(11) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('M','F') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `idx_users_cpf` (`cpf`),
  KEY `idx_users_role` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.beneficiaries definition

CREATE TABLE `beneficiaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type` enum('TITULAR','DEPENDENTE') NOT NULL DEFAULT 'TITULAR',
  `titular_id` int DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `birth_date` date NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` char(2) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `service_type` enum('CLINICO','PREMIUM','FAMILIAR') NOT NULL DEFAULT 'CLINICO',
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `face_scan_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `face_scan_requested` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_beneficiaries_cpf` (`cpf`),
  UNIQUE KEY `uq_beneficiaries_user_id` (`user_id`),
  KEY `idx_beneficiaries_titular` (`titular_id`),
  KEY `fk_beneficiaries_created_by` (`created_by`),
  CONSTRAINT `fk_beneficiaries_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_beneficiaries_titular` FOREIGN KEY (`titular_id`) REFERENCES `beneficiaries` (`id`),
  CONSTRAINT `fk_beneficiaries_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.beneficiary_face_scan_usages (Face Scan — auditoria de aberturas)

CREATE TABLE `beneficiary_face_scan_usages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `beneficiary_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_beneficiary_face_scan_usages_beneficiary` (`beneficiary_id`),
  KEY `idx_beneficiary_face_scan_usages_created` (`created_at`),
  CONSTRAINT `fk_bfsu_beneficiary` FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiaries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bfsu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.doctors definition

CREATE TABLE `doctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `profession` enum('MEDICO','PSICOLOGO','NUTRICIONISTA') NOT NULL DEFAULT 'MEDICO',
  `registry_type` enum('CRM','CRP','CFN') NOT NULL DEFAULT 'CRM',
  `registry_number` varchar(30) DEFAULT NULL,
  `registry_uf` char(2) DEFAULT NULL,
  `rqe` varchar(20) DEFAULT NULL,
  `photo_url` text,
  `council_doc_url` text,
  `specialization_doc_url` text,
  `acceptance_term_url` text,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `memed_external_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `idx_doctors_memed_external_id` (`memed_external_id`),
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.password_reset_tokens definition

CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_token` (`user_id`,`token`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.patients definition

CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.reseller_sales definition

CREATE TABLE `reseller_sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `reseller_id` int DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `partner_id` int DEFAULT NULL,
  `beneficiary_id` int DEFAULT NULL,
  `cpf` varchar(14) NOT NULL,
  `plan_type` enum('CLINICO','PREMIUM','FAMILIAR') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `gateway` varchar(50) NOT NULL DEFAULT 'asaas',
  `gateway_subscription_id` varchar(100) DEFAULT NULL,
  `gateway_payment_id` varchar(100) DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','OVERDUE','REFUNDED','FAILED','CANCELED') NOT NULL DEFAULT 'PENDING',
  `commission_partner` decimal(10,2) DEFAULT '0.00',
  `commission_branch` decimal(10,2) DEFAULT '0.00',
  `commission_reseller` decimal(10,2) DEFAULT '0.00',
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reseller_sales_uuid` (`uuid`),
  KEY `idx_reseller_sales_reseller` (`reseller_id`),
  KEY `idx_reseller_sales_branch` (`branch_id`),
  KEY `idx_reseller_sales_partner` (`partner_id`),
  KEY `idx_reseller_sales_cpf` (`cpf`),
  KEY `idx_reseller_sales_status` (`status`),
  KEY `idx_reseller_sales_created` (`created_at`),
  KEY `idx_reseller_sales_beneficiary` (`beneficiary_id`),
  CONSTRAINT `fk_reseller_sales_beneficiary` FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiaries` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reseller_sales_branch` FOREIGN KEY (`branch_id`) REFERENCES `partner_branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reseller_sales_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reseller_sales_reseller` FOREIGN KEY (`reseller_id`) REFERENCES `resellers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.appointments definition

CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `patient_id` int DEFAULT NULL,
  `specialty_id` int NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('SCHEDULED','IN_PROGRESS','FINISHED','CANCELED') DEFAULT 'SCHEDULED',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `type` enum('ONLINE','PRESENTIAL') NOT NULL DEFAULT 'ONLINE',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `beneficiary_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_doctor_datetime` (`doctor_id`,`date`,`start_time`),
  KEY `specialty_id` (`specialty_id`),
  KEY `idx_appointments_doctor_date` (`doctor_id`,`date`),
  KEY `idx_appointments_patient_date` (`patient_id`,`date`),
  KEY `appointments_ibfk_created_by` (`created_by`),
  KEY `idx_appointments_beneficiary_date` (`beneficiary_id`,`date`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`id`),
  CONSTRAINT `appointments_ibfk_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_appointments_beneficiary` FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiaries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.doctor_schedule_blocks definition

CREATE TABLE `doctor_schedule_blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `doctor_schedule_blocks_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.doctor_schedules definition

CREATE TABLE `doctor_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `weekday` tinyint NOT NULL COMMENT '0=Domingo, 6=Sábado',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `doctor_schedules_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.doctor_specialties definition

CREATE TABLE `doctor_specialties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `specialty_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_doctor_specialty` (`doctor_id`,`specialty_id`),
  KEY `specialty_id` (`specialty_id`),
  CONSTRAINT `doctor_specialties_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `doctor_specialties_ibfk_2` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.payment_webhook_events definition

CREATE TABLE `payment_webhook_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` varchar(100) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `gateway` varchar(50) NOT NULL DEFAULT 'asaas',
  `payload` json NOT NULL,
  `sale_id` int DEFAULT NULL,
  `processed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_webhook_event_id` (`event_id`),
  KEY `idx_webhook_sale` (`sale_id`),
  CONSTRAINT `fk_webhook_sale` FOREIGN KEY (`sale_id`) REFERENCES `reseller_sales` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.teleconsult_rooms definition

CREATE TABLE `teleconsult_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `room_name` varchar(150) NOT NULL,
  `doctor_link` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `patient_link` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `started_at` timestamp NULL DEFAULT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `teleconsult_rooms_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- totalmedi.appointment_logs definition

CREATE TABLE `appointment_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `action` enum('CREATED','STARTED','FINISHED','CANCELED') NOT NULL,
  `performed_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `performed_by` (`performed_by`),
  KEY `idx_logs_appointment` (`appointment_id`),
  CONSTRAINT `appointment_logs_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `appointment_logs_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;