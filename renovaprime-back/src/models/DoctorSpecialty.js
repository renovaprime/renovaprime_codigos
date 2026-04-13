const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorSpecialty = sequelize.define('DoctorSpecialty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  specialty_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'doctor_specialties',
  timestamps: false
});

module.exports = DoctorSpecialty;
