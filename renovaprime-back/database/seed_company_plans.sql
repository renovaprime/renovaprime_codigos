-- Seed sugerido — planos empresariais B2B (fase 02)
-- Executar após ddl_company_plans.sql

INSERT INTO `company_plans` (`name`, `description`, `billing_type`, `service_type`, `active`)
SELECT 'Clínico', 'Plano clínico por vida', 'PER_LIFE', 'CLINICO', 1
WHERE NOT EXISTS (SELECT 1 FROM `company_plans` WHERE `name` = 'Clínico' AND `service_type` = 'CLINICO');

INSERT INTO `company_plans` (`name`, `description`, `billing_type`, `service_type`, `active`)
SELECT 'Clínico + Especialista', 'Plano premium por vida', 'PER_LIFE', 'PREMIUM', 1
WHERE NOT EXISTS (SELECT 1 FROM `company_plans` WHERE `name` = 'Clínico + Especialista' AND `service_type` = 'PREMIUM');

INSERT INTO `company_plans` (`name`, `description`, `billing_type`, `service_type`, `active`)
SELECT 'Clínico Familiar', 'Plano familiar por família', 'PER_FAMILY', 'FAMILIAR', 1
WHERE NOT EXISTS (SELECT 1 FROM `company_plans` WHERE `name` = 'Clínico Familiar' AND `service_type` = 'FAMILIAR');

-- Faixas Clínico
INSERT INTO `company_plan_price_tiers` (`company_plan_id`, `lives_from`, `lives_to`, `unit_price`, `active`)
SELECT p.id, 1, 10, 44.90, 1 FROM `company_plans` p
WHERE p.name = 'Clínico' AND p.service_type = 'CLINICO'
  AND NOT EXISTS (SELECT 1 FROM `company_plan_price_tiers` t WHERE t.company_plan_id = p.id AND t.lives_from = 1);

INSERT INTO `company_plan_price_tiers` (`company_plan_id`, `lives_from`, `lives_to`, `unit_price`, `active`)
SELECT p.id, 11, 30, 34.90, 1 FROM `company_plans` p
WHERE p.name = 'Clínico' AND p.service_type = 'CLINICO'
  AND NOT EXISTS (SELECT 1 FROM `company_plan_price_tiers` t WHERE t.company_plan_id = p.id AND t.lives_from = 11);

INSERT INTO `company_plan_price_tiers` (`company_plan_id`, `lives_from`, `lives_to`, `unit_price`, `active`)
SELECT p.id, 31, 99, 29.90, 1 FROM `company_plans` p
WHERE p.name = 'Clínico' AND p.service_type = 'CLINICO'
  AND NOT EXISTS (SELECT 1 FROM `company_plan_price_tiers` t WHERE t.company_plan_id = p.id AND t.lives_from = 31);

-- Faixas Premium
INSERT INTO `company_plan_price_tiers` (`company_plan_id`, `lives_from`, `lives_to`, `unit_price`, `active`)
SELECT p.id, 1, 10, 59.90, 1 FROM `company_plans` p
WHERE p.name = 'Clínico + Especialista' AND p.service_type = 'PREMIUM'
  AND NOT EXISTS (SELECT 1 FROM `company_plan_price_tiers` t WHERE t.company_plan_id = p.id AND t.lives_from = 1);

INSERT INTO `company_plan_price_tiers` (`company_plan_id`, `lives_from`, `lives_to`, `unit_price`, `active`)
SELECT p.id, 11, 30, 49.90, 1 FROM `company_plans` p
WHERE p.name = 'Clínico + Especialista' AND p.service_type = 'PREMIUM'
  AND NOT EXISTS (SELECT 1 FROM `company_plan_price_tiers` t WHERE t.company_plan_id = p.id AND t.lives_from = 11);

INSERT INTO `company_plan_price_tiers` (`company_plan_id`, `lives_from`, `lives_to`, `unit_price`, `active`)
SELECT p.id, 31, 99, 39.90, 1 FROM `company_plans` p
WHERE p.name = 'Clínico + Especialista' AND p.service_type = 'PREMIUM'
  AND NOT EXISTS (SELECT 1 FROM `company_plan_price_tiers` t WHERE t.company_plan_id = p.id AND t.lives_from = 31);

-- Faixas Familiar
INSERT INTO `company_plan_price_tiers` (`company_plan_id`, `lives_from`, `lives_to`, `unit_price`, `active`)
SELECT p.id, 1, 10, 99.90, 1 FROM `company_plans` p
WHERE p.name = 'Clínico Familiar' AND p.service_type = 'FAMILIAR'
  AND NOT EXISTS (SELECT 1 FROM `company_plan_price_tiers` t WHERE t.company_plan_id = p.id AND t.lives_from = 1);

INSERT INTO `company_plan_price_tiers` (`company_plan_id`, `lives_from`, `lives_to`, `unit_price`, `active`)
SELECT p.id, 11, 30, 89.90, 1 FROM `company_plans` p
WHERE p.name = 'Clínico Familiar' AND p.service_type = 'FAMILIAR'
  AND NOT EXISTS (SELECT 1 FROM `company_plan_price_tiers` t WHERE t.company_plan_id = p.id AND t.lives_from = 11);

INSERT INTO `company_plan_price_tiers` (`company_plan_id`, `lives_from`, `lives_to`, `unit_price`, `active`)
SELECT p.id, 31, 99, 79.90, 1 FROM `company_plans` p
WHERE p.name = 'Clínico Familiar' AND p.service_type = 'FAMILIAR'
  AND NOT EXISTS (SELECT 1 FROM `company_plan_price_tiers` t WHERE t.company_plan_id = p.id AND t.lives_from = 31);
