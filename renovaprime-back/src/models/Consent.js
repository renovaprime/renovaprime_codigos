const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Consent = sequelize.define('Consent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  beneficiary_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('TELECONSULT'),
    defaultValue: 'TELECONSULT'
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  accepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  accepted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'consents',
  timestamps: false
});

module.exports = Consent;
