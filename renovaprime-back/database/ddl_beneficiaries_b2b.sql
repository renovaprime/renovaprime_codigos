-- B2B fase 03: vidas empresariais em beneficiaries
-- Executar manualmente no banco (migrate.js não cria tabelas).

ALTER TABLE `beneficiaries`
  ADD COLUMN `company_id` int DEFAULT NULL AFTER `titular_id`,
  ADD COLUMN `kinship` enum('conjuge','filho','enteado','pai','mae','irmao','outro') DEFAULT NULL AFTER `company_id`;

ALTER TABLE `beneficiaries`
  ADD KEY `idx_beneficiaries_company_id` (`company_id`),
  ADD KEY `idx_beneficiaries_company_status_type` (`company_id`, `status`, `type`),
  ADD CONSTRAINT `fk_beneficiaries_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;
