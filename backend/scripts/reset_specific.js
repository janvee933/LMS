const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/user');

const resetSpecific = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const usersToUpdate = [
      { email: 'rosy@gmail.com', newPass: 'rosy123' },
      { email: 'admin@lms.com', newPass: 'admin123' },
      { email: 'noa@instructor.com', newPass: 'noa1234' },
      { email: 'john@instructor.com', newPass: 'john123' },
      { email: 'janvee@gmail.com', newPass: 'janvee123' }
    ];

    for (const item of usersToUpdate) {
      const u = await mongoose.model('User').findOne({ email: item.email });
      if (u) {
        await User.update(u._id, { password: item.newPass });
        console.log(`Reset ${item.email} to ${item.newPass}`);
      }
    }

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
resetSpecific();
