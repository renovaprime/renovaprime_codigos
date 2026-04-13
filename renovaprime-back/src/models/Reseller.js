const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reseller = sequelize.define('Reseller', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pix_key: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(25),
    allowNull: true
  },
  functional_unit: {
    type: DataTypes.STRING(25),
    allowNull: true
  },
  registration_code: {
    type: DataTypes.STRING(25),
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
  tableName: 'resellers',
  timestamps: false
});

module.exports = Reseller;
