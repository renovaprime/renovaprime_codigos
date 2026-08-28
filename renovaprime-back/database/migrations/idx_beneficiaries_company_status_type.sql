-- Relatórios B2B: acelera COUNT de vidas/titulares por empresa.
-- Executar manualmente no banco (migrate.js não aplica este arquivo).

ALTER TABLE `beneficiaries`
  ADD INDEX `idx_beneficiaries_company_status_type` (`company_id`, `status`, `type`);
