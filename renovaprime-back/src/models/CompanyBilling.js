const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanyBilling = sequelize.define('CompanyBilling', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  competence: {
    type: DataTypes.STRING(7),
    allowNull: false
  },
  billing_type: {
    type: DataTypes.ENUM('PER_LIFE', 'PER_FAMILY'),
    allowNull: false
  },
  total_lives: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_families: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  asaas_payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  asaas_invoice_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELED', 'ERROR'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  error_message: {
    type: DataTypes.TEXT,
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
  tableName: 'company_billings',
  timestamps: false
});

module.exports = CompanyBilling;
