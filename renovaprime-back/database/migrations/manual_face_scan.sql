-- Face Scan: colunas em beneficiaries + tabela de usos
-- Executar manualmente no MySQL/MariaDB do ambiente (uma vez).
-- Se as colunas já existirem, comente o ALTER ou rode só o CREATE TABLE se faltar.

ALTER TABLE beneficiaries
  ADD COLUMN face_scan_enabled TINYINT(1) NOT NULL DEFAULT 0
    COMMENT '1 = admin liberou Face Scan para este beneficiário'
    AFTER status,
  ADD COLUMN face_scan_requested TINYINT(1) NOT NULL DEFAULT 0
    COMMENT '1 = paciente solicitou pelo app; admin pode filtrar para liberar'
    AFTER face_scan_enabled;

CREATE TABLE beneficiary_face_scan_usages (
  id INT NOT NULL AUTO_INCREMENT,
  beneficiary_id INT NOT NULL,
  user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_beneficiary_face_scan_usages_beneficiary (beneficiary_id),
  KEY idx_beneficiary_face_scan_usages_created (created_at),
  CONSTRAINT fk_bfsu_beneficiary
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_bfsu_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Rollback opcional:
-- DROP TABLE IF EXISTS beneficiary_face_scan_usages;
-- ALTER TABLE beneficiaries DROP COLUMN face_scan_requested, DROP COLUMN face_scan_enabled;
