const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolled_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

enrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

enrollmentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const EnrollmentModel = mongoose.model('Enrollment', enrollmentSchema);

const Lesson = require('./lesson');
const Progress = require('./progress');
const Quiz = require('./quiz');
const Certificate = require('./certificate');
const User = require('./user');
const Course = require('./course');

const Enrollment = {
  async enroll(user_id, course_id) {
    const enrollment = new EnrollmentModel({ user_id, course_id });
    const saved = await enrollment.save();
    return saved.id;
  },

  async isEnrolled(user_id, course_id) {
    const enrollment = await EnrollmentModel.findOne({ user_id, course_id });
    return !!enrollment;
  },

  async getByUser(user_id) {
    const enrollments = await EnrollmentModel.find({ user_id })
      .populate('course_id')
      .lean();
    
    const Lesson = mongoose.model('Lesson');
    const Progress = mongoose.model('Progress');

    const result = await Promise.all(enrollments.map(async (e) => {
      const courseId = e.course_id?._id;
      if (!courseId) return null;

      const lessons = await Lesson.find({ course_id: courseId }).select('_id');
      const total_lessons = lessons.length;
      
      let completed_lessons = 0;
      if (total_lessons > 0) {
        const lessonIds = lessons.map(l => l._id);
        completed_lessons = await Progress.countDocuments({
          user_id,
          lesson_id: { $in: lessonIds },
          status: 'completed'
        });
      }
      
      const progress = total_lessons > 0 ? Math.round((completed_lessons / total_lessons) * 100) : 0;

      // Fetch quiz and certificate status
      const QuizResult = mongoose.model('QuizResult');
      const Certificate = mongoose.model('Certificate');
      
      const quizRes = await QuizResult.findOne({ user_id, course_id: courseId }).lean();
      const cert = await Certificate.findOne({ user_id, course_id: courseId }).lean();

      return {
        ...e,
        id: e._id.toString(),
        course_id: courseId.toString(),
        title: e.course_id?.title,
        thumbnail: e.course_id?.thumbnail,
        progress,
        total_lessons,
        completed_lessons,
        quiz_attempts: quizRes ? quizRes.attempts_count : 0,
        quiz_status: quizRes ? quizRes.status : 'not_started',
        completed_at: cert ? cert.issued_at : null
      };
    }));

    return result.filter(Boolean);
  },

  async getByInstructor(instructor_id) {
    const Course = mongoose.model('Course');
    const Lesson = mongoose.model('Lesson');
    const Progress = mongoose.model('Progress');
    
    const courses = await Course.find({ instructor_id }).select('_id');
    const courseIds = courses.map(c => c._id);

    const enrollments = await EnrollmentModel.find({ course_id: { $in: courseIds } })
      .populate('user_id', 'name email')
      .populate('course_id', 'title')
      .lean();

    const result = await Promise.all(enrollments.map(async (e) => {
      const courseId = e.course_id?._id;
      const studentId = e.user_id?._id;
      if (!courseId || !studentId) return null;

      const lessons = await Lesson.find({ course_id: courseId }).select('_id');
      const total_lessons = lessons.length;
      
      let completed_lessons = 0;
      if (total_lessons > 0) {
        const lessonIds = lessons.map(l => l._id);
        completed_lessons = await Progress.countDocuments({
          user_id: studentId,
          lesson_id: { $in: lessonIds },
          status: 'completed'
        });
      }

      // Fetch quiz and certificate status
      const QuizResult = mongoose.model('QuizResult');
      const Certificate = mongoose.model('Certificate');
      
      const quizRes = await QuizResult.findOne({ user_id: studentId, course_id: courseId }).lean();
      const cert = await Certificate.findOne({ user_id: studentId, course_id: courseId }).lean();

      return {
        ...e,
        id: e._id.toString(),
        course_id: courseId.toString(),
        student_id: studentId.toString(),
        student_name: e.user_id?.name,
        student_email: e.user_id?.email,
        course_title: e.course_id?.title,
        total_lessons,
        completed_lessons,
        quiz_attempts: quizRes ? quizRes.attempts_count : 0,
        quiz_status: quizRes ? quizRes.status : 'not_started',
        completed_at: cert ? cert.issued_at : null
      };
    }));
    
    return result.filter(Boolean);
  },

  async getAllAdmin() {
    const Lesson = mongoose.model('Lesson');
    const Progress = mongoose.model('Progress');
    
    const enrollments = await EnrollmentModel.find()
      .populate('user_id', 'name email')
      .populate('course_id', 'title')
      .lean();

    const result = await Promise.all(enrollments.map(async (e) => {
      const courseId = e.course_id?._id;
      const studentId = e.user_id?._id;
      if (!courseId || !studentId) return null;

      const lessons = await Lesson.find({ course_id: courseId }).select('_id');
      const total_lessons = lessons.length;
      
      let completed_lessons = 0;
      if (total_lessons > 0) {
        const lessonIds = lessons.map(l => l._id);
        completed_lessons = await Progress.countDocuments({
          user_id: studentId,
          lesson_id: { $in: lessonIds },
          status: 'completed'
        });
      }

      // Fetch quiz and certificate status
      const QuizResult = mongoose.model('QuizResult');
      const Certificate = mongoose.model('Certificate');
      
      const quizRes = await QuizResult.findOne({ user_id: studentId, course_id: courseId }).lean();
      const cert = await Certificate.findOne({ user_id: studentId, course_id: courseId }).lean();

      return {
        ...e,
        id: e._id.toString(),
        course_id: courseId.toString(),
        student_id: studentId.toString(),
        student_name: e.user_id?.name,
        student_email: e.user_id?.email,
        course_title: e.course_id?.title,
        total_lessons,
        completed_lessons,
        quiz_attempts: quizRes ? quizRes.attempts_count : 0,
        quiz_status: quizRes ? quizRes.status : 'not_started',
        completed_at: cert ? cert.issued_at : null
      };
    }));
    
    return result.filter(Boolean);
  },

  async getStudentCount(course_id) {
    return await EnrollmentModel.countDocuments({ course_id });
  },
};

module.exports = Enrollment;

