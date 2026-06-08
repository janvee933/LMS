const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const ProgressModel = require('../models/progress');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    // Find raw progress documents
    const mongooseProgressModel = mongoose.model('Progress');
    const docs = await mongooseProgressModel.find({}).lean();
    console.log("RAW PROGRESS DOCS:", JSON.stringify(docs, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
