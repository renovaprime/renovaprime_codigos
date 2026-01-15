const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  profession: {
    type: DataTypes.ENUM('MEDICO', 'PSICOLOGO', 'NUTRICIONISTA'),
    allowNull: false,
    defaultValue: 'MEDICO'
  },
  registry_type: {
    type: DataTypes.ENUM('CRM', 'CRP', 'CFN'),
    allowNull: false,
    defaultValue: 'CRM'
  },
  registry_number: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  registry_uf: {
    type: DataTypes.CHAR(2),
    allowNull: true
  },
  rqe: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  photo_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  council_doc_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialization_doc_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  acceptance_term_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'doctors',
  timestamps: false
});

module.exports = Doctor;
