const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/user');

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findByEmail('rosy@gmail.com');
    if (!user) {
      console.log('User not found');
    } else {
      console.log('User found:', user.email);
      console.log('Password hash in DB:', user.password);
      const isMatch = await bcrypt.compare('rosy123', user.password);
      console.log('Does rosy123 match?', isMatch);
      const isMatch2 = await bcrypt.compare('123', user.password);
      console.log('Does 123 match?', isMatch2);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
check();
