require('dotenv').config();
const sequelize = require('../config/database');

async function migrate() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Running migrations...');
    console.log('Note: Tables should be created manually using the DDL from database/ddl.txt');
    console.log('This script only tests the connection.');

    console.log('Migration check completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
