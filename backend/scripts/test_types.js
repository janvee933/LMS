const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const progressDocs = await db.collection('progresses').find({}).toArray();
    
    if (progressDocs.length > 0) {
      console.log("Type of user_id:", typeof progressDocs[0].user_id, progressDocs[0].user_id instanceof mongoose.Types.ObjectId ? "ObjectId" : "");
      console.log("Type of lesson_id:", typeof progressDocs[0].lesson_id, progressDocs[0].lesson_id instanceof mongoose.Types.ObjectId ? "ObjectId" : "");
    }
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
