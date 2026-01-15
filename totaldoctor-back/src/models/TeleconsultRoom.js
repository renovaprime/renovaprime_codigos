const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeleconsultRoom = sequelize.define('TeleconsultRoom', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  room_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  doctor_link: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  patient_link: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'teleconsult_rooms',
  timestamps: false
});

module.exports = TeleconsultRoom;
