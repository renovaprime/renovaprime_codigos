const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanyPlanPriceTier = sequelize.define('CompanyPlanPriceTier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lives_from: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lives_to: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
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
  tableName: 'company_plan_price_tiers',
  timestamps: false
});

module.exports = CompanyPlanPriceTier;
