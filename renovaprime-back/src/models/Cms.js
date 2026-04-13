const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cms = sequelize.define('Cms', {
  key: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'cms',
  timestamps: false
});

module.exports = Cms;
