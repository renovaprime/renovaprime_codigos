const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BeneficiaryFaceScanUsage = sequelize.define(
  'BeneficiaryFaceScanUsage',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    beneficiary_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'beneficiary_id'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  },
  {
    tableName: 'beneficiary_face_scan_usages',
    timestamps: false
  }
);

module.exports = BeneficiaryFaceScanUsage;
