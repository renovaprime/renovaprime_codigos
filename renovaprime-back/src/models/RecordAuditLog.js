const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecordAuditLog = sequelize.define('RecordAuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  medical_record_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  actor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('CREATED', 'UPDATED', 'SIGNED', 'VIEWED', 'ATTACHMENT_ADDED'),
    allowNull: false
  },
  changes_json: {
    type: DataTypes.JSON,
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
  tableName: 'record_audit_logs',
  timestamps: false
});

module.exports = RecordAuditLog;
