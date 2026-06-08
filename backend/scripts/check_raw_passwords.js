const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/user');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await mongoose.model('User').find({});
    for (const u of users) {
      console.log(u.email, u.password.substring(0, 20) + '...');
    }
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
