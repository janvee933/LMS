const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/user');

const resetAllPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.findAll();
    console.log(`Found ${users.length} users. Resetting passwords to 123...`);
    
    for (const u of users) {
      await User.update(u._id, { password: '123' });
      console.log(`Reset password for ${u.email} to 123`);
    }
    
    console.log("All passwords reset successfully.");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
resetAllPasswords();
