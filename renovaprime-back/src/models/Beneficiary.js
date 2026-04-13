const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Beneficiary = sequelize.define('Beneficiary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('TITULAR', 'DEPENDENTE'),
    allowNull: false,
    defaultValue: 'TITULAR'
  },
  titular_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.CHAR(2),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  service_type: {
    type: DataTypes.ENUM('CLINICO', 'PREMIUM', 'FAMILIAR'),
    allowNull: false,
    defaultValue: 'CLINICO'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'beneficiaries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Beneficiary;
