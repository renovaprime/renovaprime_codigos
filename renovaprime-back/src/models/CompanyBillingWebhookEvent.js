const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanyBillingWebhookEvent = sequelize.define('CompanyBillingWebhookEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  event_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gateway: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'asaas'
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false
  },
  company_billing_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'company_billing_webhook_events',
  timestamps: false
});

module.exports = CompanyBillingWebhookEvent;
