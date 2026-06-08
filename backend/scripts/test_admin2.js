const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Enrollment = require('../models/enrollment');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const rows = await Enrollment.getAllAdmin();
    
    const studentsMap = {};
    rows.forEach(r => {
      const email = r.student_email;
      const progress = r.total_lessons > 0 ? Math.round((r.completed_lessons / r.total_lessons) * 100) : 0;
      
      if (!studentsMap[email]) {
        studentsMap[email] = {
          student_id: r.student_id,
          student_name: r.student_name,
          student_email: r.student_email,
          courses_count: 0,
          courses: []
        };
      }
      
      studentsMap[email].courses.push({
        id: r.id,
        course_id: r.course_id,
        student_id: r.student_id,
        course_title: r.course_title,
        enrolled_at: r.enrolled_at,
        completed_at: r.completed_at,
        quiz_attempts: r.quiz_attempts || 0,
        quiz_status: r.quiz_status || 'not_started',
        progress: progress
      });
      studentsMap[email].courses_count++;

      // Overall Progress average
      const totalProgress = studentsMap[email].courses.reduce((sum, c) => sum + (c.progress || 0), 0);
      studentsMap[email].avg_progress = Math.round(totalProgress / studentsMap[email].courses_count);
    });

    const data = Object.values(studentsMap);
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
