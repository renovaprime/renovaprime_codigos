const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  legal_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  trade_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cnpj: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  zip_code: {
    type: DataTypes.STRING(8),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  state_registration: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  responsible_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  responsible_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  responsible_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  asaas_customer_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
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
  tableName: 'companies',
  timestamps: false
});

module.exports = Company;
