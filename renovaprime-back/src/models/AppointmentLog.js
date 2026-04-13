const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentLog = sequelize.define('AppointmentLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('CREATED', 'STARTED', 'FINISHED', 'CANCELED'),
    allowNull: false
  },
  performed_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'appointment_logs',
  timestamps: false
});

module.exports = AppointmentLog;
