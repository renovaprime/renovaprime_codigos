const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Partner = sequelize.define('Partner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cnpj: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  bank_agency: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bank_account: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bank_digit: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  pix_key: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  logo_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  website_url: {
    type: DataTypes.STRING(250),
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
  tableName: 'partners',
  timestamps: false
});

module.exports = Partner;
