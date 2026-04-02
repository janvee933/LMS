const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const Progress = require('../models/progress');
const Lesson = require('../models/lesson');
const Certificate = require('../models/certificate');
const Quiz = require('../models/quiz');

const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user_id = req.user.id;

    // 1. Verify Enrollment
    const enrolled = await Enrollment.isEnrolled(user_id, courseId);
    if (!enrolled) return res.status(403).json({ success: false, message: 'Not enrolled' });

    // 2. Verify Lesson Completion
    const lessons = await Lesson.getByCourse(courseId);
    if (!lessons.length) return res.status(400).json({ success: false, message: 'Course has no lessons' });
    
    const progress = await Progress.getProgressByCourse(user_id, courseId);
    const completedLessonIds = progress
      .filter(p => p.status === 'completed')
      .map(p => p.lesson_id);

    const allCompleted = lessons.every(lesson => completedLessonIds.includes(lesson.id));
    if (!allCompleted) {
      return res.status(400).json({ success: false, message: 'All lessons must be completed first' });
    }

    // 3. Verify Final Quiz Passing (>= 65%)
    const courseQuizzes = await Quiz.getFinalQuizByCourse(courseId);
    if (courseQuizzes.length > 0) {
      const quizRes = await Quiz.getResult(user_id, courseId);
      if (!quizRes || quizRes.status !== 'passed' || quizRes.best_score < 65) {
        return res.status(400).json({ 
          success: false, 
          message: 'You must pass the Final Quiz with 65% or more to earn a certificate',
          quiz_required: true 
        });
      }
    }

    // 4. Check if already issued
    let certificate = await Certificate.getByUserAndCourse(user_id, courseId);
    
    if (!certificate) {
      // 4. Issue New Certificate
      const certId = `CERT-${Date.now()}-${user_id}-${courseId}`;
      await Certificate.issue(user_id, courseId, certId);
      certificate = await Certificate.getByUserAndCourse(user_id, courseId);
    }

    const course = await Course.getById(courseId);

    res.status(200).json({
      success: true,
      data: {
        ...certificate,
        user_name: req.user.name,
        course_title: course.title,
        instructor_name: course.instructor_name
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateCertificate };
