const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testApi = async () => {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'rosy@gmail.com',
      password: '123'
    });
    const token = loginRes.data.token;
    
    console.log("GET /api/enrollments/my-enrollments");
    const enrollRes = await axios.get('http://localhost:5000/api/enrollments/my-enrollments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("My Enrollments Progresses:", enrollRes.data.data.map(e => `${e.title}: ${e.progress}% (Completed: ${e.completed_lessons}/${e.total_lessons})`));
    
    const adminLoginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@lms.com',
      password: 'admin123'
    });
    const adminToken = adminLoginRes.data.token;
    
    console.log("GET /api/enrollments/admin/all");
    const adminRes = await axios.get('http://localhost:5000/api/enrollments/admin/all', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("Admin Enrollments:", adminRes.data.data.map(u => `${u.student_name} (${u.student_email}): Avg ${u.avg_progress}%, Courses: ${u.courses.map(c => `${c.course_title} [${c.progress}%]`).join(', ')}`));

    process.exit(0);
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
    process.exit(1);
  }
}
testApi();
