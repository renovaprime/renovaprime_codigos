const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResellerSale = sequelize.define('ResellerSale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.STRING(36),
    allowNull: false,
    unique: true
  },
  reseller_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  partner_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  beneficiary_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false
  },
  plan_type: {
    type: DataTypes.ENUM('CLINICO', 'PREMIUM', 'FAMILIAR'),
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  gateway: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'asaas'
  },
  gateway_subscription_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  gateway_payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'OVERDUE', 'REFUNDED', 'FAILED', 'CANCELED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  commission_partner: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  commission_branch: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  commission_reseller: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'reseller_sales',
  timestamps: false
});

module.exports = ResellerSale;
