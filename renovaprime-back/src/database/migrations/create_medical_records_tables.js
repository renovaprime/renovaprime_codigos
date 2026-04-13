const sequelize = require('../../config/database');

async function up() {
  const queryInterface = sequelize.getQueryInterface();

  // 1. medical_records
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      appointment_id INT NOT NULL,
      beneficiary_id INT NOT NULL,
      doctor_id INT NOT NULL,
      chief_complaint TEXT,
      hpi TEXT,
      personal_history TEXT,
      surgical_history TEXT,
      allergies TEXT,
      current_medications TEXT,
      comorbidities TEXT,
      habits TEXT,
      family_history TEXT,
      vitals_json JSON,
      physical_exam TEXT,
      assessment TEXT,
      diagnosis TEXT,
      cid10 VARCHAR(10),
      plan TEXT,
      guidance TEXT,
      return_instructions TEXT,
      red_flags TEXT,
      referrals TEXT,
      exam_requests TEXT,
      status ENUM('DRAFT','SIGNED') DEFAULT 'DRAFT',
      signed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_medical_record_appointment (appointment_id),
      KEY idx_medical_records_beneficiary (beneficiary_id),
      KEY idx_medical_records_doctor (doctor_id),
      CONSTRAINT fk_medical_records_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
      CONSTRAINT fk_medical_records_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id),
      CONSTRAINT fk_medical_records_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. record_attachments
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS record_attachments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      medical_record_id INT NOT NULL,
      category ENUM('EXAM','IMAGE','REPORT','CERTIFICATE','REFERRAL','OTHER') NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_url VARCHAR(500) NOT NULL,
      mime_type VARCHAR(100),
      uploaded_by INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_record_attachments_record (medical_record_id),
      CONSTRAINT fk_record_attachments_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id),
      CONSTRAINT fk_record_attachments_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. record_audit_logs
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS record_audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      medical_record_id INT NOT NULL,
      actor_id INT NOT NULL,
      action ENUM('CREATED','UPDATED','SIGNED','VIEWED','ATTACHMENT_ADDED') NOT NULL,
      changes_json JSON,
      ip VARCHAR(45),
      user_agent VARCHAR(500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_record_audit_logs_record (medical_record_id),
      KEY idx_record_audit_logs_actor (actor_id),
      CONSTRAINT fk_record_audit_logs_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id),
      CONSTRAINT fk_record_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. consents
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS consents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      beneficiary_id INT NOT NULL,
      appointment_id INT NOT NULL,
      type ENUM('TELECONSULT') DEFAULT 'TELECONSULT',
      version VARCHAR(20) NOT NULL,
      accepted BOOLEAN NOT NULL DEFAULT FALSE,
      accepted_at DATETIME,
      ip VARCHAR(45),
      user_agent VARCHAR(500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_consents_beneficiary (beneficiary_id),
      KEY idx_consents_appointment (appointment_id),
      CONSTRAINT fk_consents_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id),
      CONSTRAINT fk_consents_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Medical records tables created successfully');
}

async function down() {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS consents');
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS record_audit_logs');
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS record_attachments');
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS medical_records');
  console.log('Medical records tables dropped successfully');
}

// Run directly
if (require.main === module) {
  const action = process.argv[2] || 'up';
  const fn = action === 'down' ? down : up;
  fn()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { up, down };
