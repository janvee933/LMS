const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Enrollment = require('../models/enrollment');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const userId = "69f64017d2f0b6efb1b0c90b";
    const data = await Enrollment.getByUser(userId);
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
