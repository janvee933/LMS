const Progress = require('../models/progress');
const Enrollment = require('../models/enrollment');
const Lesson = require('../models/lesson');

const updateProgress = async (req, res) => {
  try {
    const { lesson_id, status } = req.body;
    const user_id = req.user.id;

    
    const lesson = await Lesson.getById(lesson_id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    
    const enrolled = await Enrollment.isEnrolled(user_id, lesson.course_id);
    if (!enrolled) {
      return res.status(403).json({ success: false, message: 'You must be enrolled in the course to track progress' });
    }

    await Progress.updateStatus(user_id, lesson_id, status);

    res.status(200).json({ success: true, message: 'Progress updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await Progress.getProgressByCourse(req.user.id, courseId);
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateProgress, getCourseProgress };
