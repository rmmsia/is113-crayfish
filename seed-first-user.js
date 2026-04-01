/**
 * Seed script for creating the first user.
 * Run with: node seed-first-user.js
 */

require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Invite = require('./models/Invite');

const USERNAME = 'admin';
const EMAIL = 'admin@example.com';
const PASSWORD = 'Admin123!';

async function seedFirstUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if any users exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Users already exist. Skipping seed.');
      console.log(`Found ${userCount} user(s) in the database.`);
      process.exit(0);
    }

    // Generate a random invite code
    const inviteCode = Math.random().toString(36).substring(2, 10);

    // Create invite record
    const invite = await Invite.create({
      createdBy: 'system',
      targetEmail: EMAIL,
      status: 'Used',
      code: inviteCode
    });

    // Create first user
    await User.create({
      username: USERNAME,
      email: EMAIL,
      password: PASSWORD,
      invitedBy: 'system'
    });

    // Update invite with user who used it
    invite.usedBy = USERNAME;
    await invite.save();

    console.log('First user created successfully!');
    console.log('-----------------------------------');
    console.log(`Username: ${USERNAME}`);
    console.log(`Email:    ${EMAIL}`);
    console.log(`Password: ${PASSWORD}`);
    console.log('-----------------------------------');
    console.log('Please change the password after first login.');

    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.error('Error: User with this username or email already exists.');
    } else {
      console.error('Error creating first user:', error.message);
    }
    process.exit(1);
  }
}

seedFirstUser();