const Enrollment = require('../models/enrollment');
const Course = require('../models/course');

const enrollCourse = async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.id;

    
    const course = await Course.getById(course_id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    
    const alreadyEnrolled = await Enrollment.isEnrolled(user_id, course_id);
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    await Enrollment.enroll(user_id, course_id);

    res.status(201).json({ success: true, message: 'Successfully enrolled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.getByUser(req.user.id);
    console.log("SENDING MY ENROLLMENTS:", JSON.stringify(enrollments, null, 2));
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignCourse = async (req, res) => {
  try {
    const { user_id, course_id } = req.body;

    
    const course = await Course.getById(course_id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    
    const alreadyEnrolled = await Enrollment.isEnrolled(user_id, course_id);
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'User is already enrolled in this course' });
    }

    await Enrollment.enroll(user_id, course_id);

    res.status(201).json({ success: true, message: 'Course assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllEnrollmentsAdmin = async (req, res) => {
  try {
    const rows = await Enrollment.getAllAdmin();

    // Grouping logic in JS
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
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getAllEnrollmentsAdmin Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInstructorEnrollments = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const rows = await Enrollment.getByInstructor(instructorId);

    // Grouping logic in JS
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
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getInstructorEnrollments Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const EnrollmentModel = require('../models/enrollment');
    const enrollmentInstances = await EnrollmentModel.getAllAdmin();
    
    const rows = enrollmentInstances.filter(e => e.course_id.toString() === courseId.toString());

    const data = rows.map(r => {
      const progress = r.total_lessons > 0 ? Math.round((r.completed_lessons / r.total_lessons) * 100) : 0;
      return {
        ...r,
        id: r.student_id,
        name: r.student_name,
        email: r.student_email,
        progress: progress
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  enrollCourse, 
  getMyEnrollments, 
  assignCourse, 
  getAllEnrollmentsAdmin, 
  getInstructorEnrollments,
  getCourseStudents
};
