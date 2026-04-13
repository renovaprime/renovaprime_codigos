require('dotenv').config();
const sequelize = require('../config/database');
const { User, Role } = require('../models');
const { hashPassword } = require('../utils/hash');

async function seedAdmin() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Fetching admin role...');
    const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });

    if (!adminRole) {
      throw new Error('Admin role not found. Please run seed.js first.');
    }

    console.log('Checking if admin user already exists...');
    const existingAdmin = await User.findOne({ where: { email: 'admin@admin.com' } });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }

    console.log('Hashing admin password...');
    const hashedPassword = await hashPassword('123456**');

    console.log('Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password_hash: hashedPassword,
      role_id: adminRole.id,
      status: 'ACTIVE'
    });

    console.log('Admin user created successfully!');
    console.log('Admin details:');
    console.log('- Email: admin@admin.com');
    console.log('- Password: 123456**');
    console.log('- Name: Admin');
    console.log('- Status: ACTIVE');

    process.exit(0);
  } catch (error) {
    console.error('Admin seeding failed:', error);
    process.exit(1);
  }
}

seedAdmin();
