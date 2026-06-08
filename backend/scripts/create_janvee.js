const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/user');

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create new admin user
    const existing = await User.findByEmail('janvee@gmail.com');
    if (!existing) {
      await User.create({
        name: 'Janvee',
        email: 'janvee@gmail.com',
        password: 'password123',
        phone: '1234567890',
        role: 'admin'
      });
      console.log('Created user janvee@gmail.com with password: password123');
    } else {
      await User.update(existing._id, { password: 'password123' });
      console.log('Updated user janvee@gmail.com password to: password123');
    }
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
createUser();
