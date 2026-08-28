const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanyPlan = sequelize.define('CompanyPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  billing_type: {
    type: DataTypes.ENUM('PER_LIFE', 'PER_FAMILY'),
    allowNull: false
  },
  service_type: {
    type: DataTypes.ENUM('CLINICO', 'PREMIUM', 'FAMILIAR'),
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'company_plans',
  timestamps: false
});

module.exports = CompanyPlan;
