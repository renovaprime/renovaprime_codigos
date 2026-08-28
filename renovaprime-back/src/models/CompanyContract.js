const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanyContract = sequelize.define('CompanyContract', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  company_plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  billing_type: {
    type: DataTypes.ENUM('PER_LIFE', 'PER_FAMILY'),
    allowNull: false
  },
  due_day: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  starts_on: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  ends_on: {
    type: DataTypes.DATEONLY,
    allowNull: true
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
  tableName: 'company_contracts',
  timestamps: false
});

module.exports = CompanyContract;
