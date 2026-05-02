const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  status: { type: String, enum: ['started', 'completed'], default: 'completed' },
  updated_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

progressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });

const ProgressModel = mongoose.model('Progress', progressSchema);

const Progress = {
  async updateStatus(user_id, lesson_id, status) {
    return await ProgressModel.findOneAndUpdate(
      { user_id, lesson_id },
      { status: status || 'completed', updated_at: Date.now() },
      { upsert: true, new: true }
    );
  },

  async getProgressByCourse(user_id, course_id) {
    const Lesson = mongoose.model('Lesson');
    const lessons = await Lesson.find({ course_id }).select('_id');
    const lessonIds = lessons.map(l => l._id);

    const progress = await ProgressModel.find({ 
      user_id, 
      lesson_id: { $in: lessonIds } 
    }).populate('lesson_id', 'title').lean();

    return progress.map(p => ({
      ...p,
      id: p._id.toString(),
      title: p.lesson_id?.title
    }));
  },
};

module.exports = Progress;

