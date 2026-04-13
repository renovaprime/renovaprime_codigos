const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanCommission = sequelize.define('PlanCommission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  partner_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plan_type: {
    type: DataTypes.ENUM('CLINICO', 'PREMIUM', 'FAMILIAR'),
    allowNull: false
  },
  partner_pct: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  branch_pct: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  reseller_pct: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
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
  tableName: 'plan_commissions',
  timestamps: false
});

module.exports = PlanCommission;
