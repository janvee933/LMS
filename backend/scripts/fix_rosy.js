const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { strict: false });
const UserModel = mongoose.model('UserTemp', userSchema, 'users');

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await UserModel.findOne({email: 'rosy@gmail.com'});
    if (user) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash('rosy123', salt);
      await user.save();
      console.log('Password reset to rosy123 successfully.');
    } else {
      console.log('User not found.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
reset();
