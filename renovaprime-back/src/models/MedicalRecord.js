const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  beneficiary_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Anamnese
  chief_complaint: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  hpi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  personal_history: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  surgical_history: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  current_medications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  comorbidities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  habits: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  family_history: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Exame / Avaliacao
  vitals_json: {
    type: DataTypes.JSON,
    allowNull: true
  },
  physical_exam: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assessment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cid10: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  // Conduta
  plan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  guidance: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  return_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  red_flags: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referrals: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  exam_requests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Controle
  status: {
    type: DataTypes.ENUM('DRAFT', 'SIGNED'),
    defaultValue: 'DRAFT'
  },
  signed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'medical_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MedicalRecord;
