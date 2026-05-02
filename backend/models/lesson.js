const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  content: { type: String },
  content_url: { type: String },
  video_url: { type: String },
  lesson_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

lessonSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const LessonModel = mongoose.model('Lesson', lessonSchema);

const Lesson = {
  async create(data) {
    const lesson = new LessonModel(data);
    const savedLesson = await lesson.save();
    return savedLesson.id;
  },

  async getByCourse(course_id) {
    const lessons = await LessonModel.find({ course_id }).sort({ lesson_order: 1 }).lean();
    return lessons.map(l => ({ ...l, id: l._id.toString() }));
  },

  async getById(id) {
    const lesson = await LessonModel.findById(id).lean();
    if (!lesson) return null;
    return { ...lesson, id: lesson._id.toString() };
  },

  async update(id, data) {
    const result = await LessonModel.findByIdAndUpdate(id, data, { new: true });
    return !!result;
  },

  async delete(id) {
    const result = await LessonModel.findByIdAndDelete(id);
    return !!result;
  },
};

module.exports = Lesson;

