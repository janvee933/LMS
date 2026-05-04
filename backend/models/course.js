const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, default: 0 },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  category: { type: String, default: 'Computer Science' },
  thumbnail: { type: String },
  video_url: { type: String },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const CourseModel = mongoose.model('Course', courseSchema);

const Course = {
  async create({ title, description, instructor_id, price, level, category, thumbnail, video_url }) {
    const course = new CourseModel({
      title,
      description,
      instructor_id,
      price: price || 0,
      level: level || 'Beginner',
      category: category || 'Computer Science',
      thumbnail,
      video_url
    });
    const savedCourse = await course.save();
    return savedCourse.id;
  },

  async getAll() {
    const Enrollment = require('./enrollment');
    const Rating = require('./rating');

    const courses = await CourseModel.find().populate('instructor_id', 'name').lean();
    
    return await Promise.all(courses.map(async (c) => {
      const studentCount = await Enrollment.getStudentCount(c._id);
      const ratingData = await Rating.getAverage(c._id);
      
      return {
        ...c,
        id: c._id.toString(),
        instructor_id: c.instructor_id?._id?.toString() || c.instructor_id?.toString(),
        instructor_name: c.instructor_id?.name,
        student_count: studentCount,
        average_rating: ratingData.avg_rating,
        rating_count: ratingData.count
      };
    }));
  },

  async getById(id) {
    const Enrollment = require('./enrollment');
    const Rating = require('./rating');

    const course = await CourseModel.findById(id).populate('instructor_id', 'name').lean();
    if (!course) return null;

    const studentCount = await Enrollment.getStudentCount(course._id);
    const ratingData = await Rating.getAverage(course._id);

    return {
      ...course,
      id: course._id.toString(),
      instructor_id: course.instructor_id?._id?.toString() || course.instructor_id?.toString(),
      instructor_name: course.instructor_id?.name,
      student_count: studentCount,
      average_rating: ratingData.avg_rating,
      rating_count: ratingData.count
    };
  },

  async getByInstructor(instructor_id) {
    const Enrollment = require('./enrollment');
    const Rating = require('./rating');
    
    const courses = await CourseModel.find({ instructor_id }).lean();
    
    return await Promise.all(courses.map(async (c) => {
      const studentCount = await Enrollment.getStudentCount(c._id);
      const ratingData = await Rating.getAverage(c._id);
      
      return {
        ...c,
        id: c._id.toString(),
        instructor_id: c.instructor_id?.toString(),
        student_count: studentCount,
        average_rating: ratingData.avg_rating,
        rating_count: ratingData.count
      };
    }));
  },

  async update(id, data) {
    const result = await CourseModel.findByIdAndUpdate(id, data, { new: true });
    return !!result;
  },

  async delete(id) {
    const result = await CourseModel.findByIdAndDelete(id);
    return !!result;
  },
};

module.exports = Course;

