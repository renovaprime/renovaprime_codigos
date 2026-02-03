CREATE OR REPLACE VIEW vw_doctor_dashboard AS
SELECT
  d.id AS doctor_id,

  -- ===== HOJE =====
  COUNT(a_today.id) AS today_total,
  COALESCE(SUM(a_today.status = 'SCHEDULED'), 0)    AS today_scheduled,
  COALESCE(SUM(a_today.status = 'IN_PROGRESS'), 0)  AS today_in_progress,
  COALESCE(SUM(a_today.status IN ('FINISHED','CANCELED')), 0) AS today_finished,

  -- ===== CONSULTA EM ANDAMENTO =====
  MAX(
    CASE 
      WHEN a_today.status = 'IN_PROGRESS'
      THEN a_today.id
      ELSE NULL
    END
  ) AS current_appointment_id,

  -- ===== PRÓXIMA CONSULTA =====
  (
    SELECT a_next.id
    FROM appointments a_next
    WHERE a_next.doctor_id = d.id
      AND a_next.status = 'SCHEDULED'
      AND (
        a_next.date > CURRENT_DATE
        OR (a_next.date = CURRENT_DATE AND a_next.start_time > CURRENT_TIME)
      )
    ORDER BY a_next.date, a_next.start_time
    LIMIT 1
  ) AS next_appointment_id,

  (
    SELECT a_next.date
    FROM appointments a_next
    WHERE a_next.doctor_id = d.id
      AND a_next.status = 'SCHEDULED'
      AND (
        a_next.date > CURRENT_DATE
        OR (a_next.date = CURRENT_DATE AND a_next.start_time > CURRENT_TIME)
      )
    ORDER BY a_next.date, a_next.start_time
    LIMIT 1
  ) AS next_appointment_date,

  (
    SELECT a_next.start_time
    FROM appointments a_next
    WHERE a_next.doctor_id = d.id
      AND a_next.status = 'SCHEDULED'
      AND (
        a_next.date > CURRENT_DATE
        OR (a_next.date = CURRENT_DATE AND a_next.start_time > CURRENT_TIME)
      )
    ORDER BY a_next.date, a_next.start_time
    LIMIT 1
  ) AS next_appointment_time

FROM doctors d
LEFT JOIN appointments a_today
  ON a_today.doctor_id = d.id
 AND a_today.date = CURRENT_DATE

GROUP BY d.id;
