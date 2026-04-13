const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecordAttachment = sequelize.define('RecordAttachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  medical_record_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('EXAM', 'IMAGE', 'REPORT', 'CERTIFICATE', 'REFERRAL', 'OTHER'),
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'record_attachments',
  timestamps: false
});

module.exports = RecordAttachment;
