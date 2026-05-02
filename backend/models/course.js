const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, default: 0 },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  category: { type: String, default: 'Development' },
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
      category: category || 'Development',
      thumbnail,
      video_url
    });
    const savedCourse = await course.save();
    return savedCourse.id;
  },

  async getAll() {
    // In a real app, we'd use aggregation for student_count and average_rating
    // For now, let's just populate the instructor
    const courses = await CourseModel.find().populate('instructor_id', 'name').lean();
    return courses.map(c => ({
      ...c,
      id: c._id.toString(),
      instructor_name: c.instructor_id?.name,
      student_count: 0, // Placeholder
      average_rating: 0, // Placeholder
      rating_count: 0 // Placeholder
    }));
  },

  async getById(id) {
    const course = await CourseModel.findById(id).populate('instructor_id', 'name').lean();
    if (!course) return null;
    return {
      ...course,
      id: course._id.toString(),
      instructor_name: course.instructor_id?.name,
      student_count: 0,
      average_rating: 0,
      rating_count: 0
    };
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

