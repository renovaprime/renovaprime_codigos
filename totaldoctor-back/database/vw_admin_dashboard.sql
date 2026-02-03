CREATE OR REPLACE VIEW vw_admin_dashboard AS
SELECT
  -- ===== USUÁRIOS =====
  (SELECT COUNT(*) FROM users u WHERE u.status = 'ACTIVE') AS users_active,
  (SELECT COUNT(*) FROM users u WHERE u.status = 'PENDING') AS users_pending,
  (SELECT COUNT(*) FROM users u WHERE u.status = 'BLOCKED') AS users_blocked,

  -- ===== MÉDICOS =====
  (SELECT COUNT(*) FROM doctors d) AS doctors_total,
  (SELECT COUNT(*) FROM doctors d WHERE d.approved_at IS NOT NULL) AS doctors_approved,
  (SELECT COUNT(*) FROM doctors d WHERE d.approved_at IS NULL) AS doctors_pending,

  -- ===== PACIENTES / BENEFICIÁRIOS =====
  (SELECT COUNT(*) FROM beneficiaries b WHERE b.status = 'ACTIVE') AS beneficiaries_active,
  (SELECT COUNT(*) FROM beneficiaries b WHERE b.status = 'INACTIVE') AS beneficiaries_inactive,

  -- ===== CONSULTAS HOJE =====
  (SELECT COUNT(*) FROM appointments a WHERE a.date = CURRENT_DATE) AS appointments_today_total,
  (SELECT COUNT(*) FROM appointments a WHERE a.date = CURRENT_DATE AND a.status = 'SCHEDULED') AS appointments_today_scheduled,
  (SELECT COUNT(*) FROM appointments a WHERE a.date = CURRENT_DATE AND a.status = 'IN_PROGRESS') AS appointments_today_in_progress,
  (SELECT COUNT(*) FROM appointments a WHERE a.date = CURRENT_DATE AND a.status IN ('FINISHED','CANCELED')) AS appointments_today_finished,

  -- ===== CONSULTAS GERAIS =====
  (SELECT COUNT(*) FROM appointments a) AS appointments_total,
  (SELECT COUNT(*) FROM appointments a WHERE a.status = 'SCHEDULED') AS appointments_scheduled,
  (SELECT COUNT(*) FROM appointments a WHERE a.status = 'IN_PROGRESS') AS appointments_in_progress,
  (SELECT COUNT(*) FROM appointments a WHERE a.status = 'FINISHED') AS appointments_finished,
  (SELECT COUNT(*) FROM appointments a WHERE a.status = 'CANCELED') AS appointments_canceled,

  -- ===== TELECONSULTAS =====
  (SELECT COUNT(*) FROM teleconsult_rooms r WHERE r.started_at IS NOT NULL AND r.ended_at IS NULL) AS teleconsults_active,
  (SELECT COUNT(*) FROM teleconsult_rooms r WHERE r.ended_at IS NOT NULL) AS teleconsults_finished;
