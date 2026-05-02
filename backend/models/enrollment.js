const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolled_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

enrollmentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const EnrollmentModel = mongoose.model('Enrollment', enrollmentSchema);

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
    
    // Simplification for now: in SQL it had complex progress calculations
    return enrollments.map(e => ({
      ...e,
      id: e._id.toString(),
      title: e.course_id?.title,
      thumbnail: e.course_id?.thumbnail,
      progress: 0, // Placeholder
      total_lessons: 0, // Placeholder
      completed_lessons: 0 // Placeholder
    }));
  },

  async getByInstructor(instructor_id) {
    // This requires finding courses by instructor first
    const Course = mongoose.model('Course');
    const courses = await Course.find({ instructor_id }).select('_id');
    const courseIds = courses.map(c => c._id);

    const enrollments = await EnrollmentModel.find({ course_id: { $in: courseIds } })
      .populate('user_id', 'name email')
      .populate('course_id', 'title')
      .lean();

    return enrollments.map(e => ({
      ...e,
      id: e._id.toString(),
      student_id: e.user_id?._id,
      student_name: e.user_id?.name,
      student_email: e.user_id?.email,
      course_title: e.course_id?.title,
      total_lessons: 0,
      completed_lessons: 0
    }));
  },

  async getAllAdmin() {
    const enrollments = await EnrollmentModel.find()
      .populate('user_id', 'name email')
      .populate('course_id', 'title')
      .lean();

    return enrollments.map(e => ({
      ...e,
      id: e._id.toString(),
      student_id: e.user_id?._id,
      student_name: e.user_id?.name,
      student_email: e.user_id?.email,
      course_title: e.course_id?.title,
      total_lessons: 0,
      completed_lessons: 0
    }));
  },
};

module.exports = Enrollment;

