const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'uq_prescription_appointment'
  },
  memed_prescription_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'uq_prescription_memed_id'
  },
  memed_uuid: {
    type: DataTypes.STRING(50),
    allowNull: false,
    index: true
  },
  memed_patient_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  signed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  memed_payload: {
    type: DataTypes.JSON,
    allowNull: false
  },
  issued_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  memed_patient_link: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null
  },
  memed_patient_digits: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: null
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'prescriptions',
  timestamps: false
});

module.exports = Prescription;
