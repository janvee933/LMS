const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const courseSchema = new mongoose.Schema({
  title: String,
  category: String
});

const Course = mongoose.model('Course', courseSchema);

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_mongodb');
    console.log('Connected to MongoDB');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses`);

    for (const course of courses) {
      let newCategory = course.category;

      if (course.title.toLowerCase().includes('networking') || /\bit\b/i.test(course.title)) {
        newCategory = 'Information Technology';
      } else if (course.title.toLowerCase().includes('java') || course.title.toLowerCase().includes('python') || course.title.toLowerCase().includes('react') || course.title.toLowerCase().includes('science') || course.title.toLowerCase().includes('algorithm')) {
        newCategory = 'Computer Science';
      } else if (course.category === 'Development' || course.category === 'Other') {
        newCategory = 'Computer Science';
      }

      if (newCategory !== course.category) {
        console.log(`Updating "${course.title}": ${course.category} -> ${newCategory}`);
        await Course.updateOne({ _id: course._id }, { $set: { category: newCategory } });
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
