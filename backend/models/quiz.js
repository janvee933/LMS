const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: false },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correct_answer: { type: String, required: true },
  is_final: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const QuizModel = mongoose.model('Quiz', quizSchema);

const quizResultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  attempts_count: { type: Number, default: 0 },
  best_score: { type: Number, default: 0 },
  status: { type: String, enum: ['passed', 'failed'], default: 'failed' },
  updated_at: { type: Date, default: Date.now }
});

quizResultSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

const QuizResultModel = mongoose.model('QuizResult', quizResultSchema);

const Quiz = {
  async create(data) {
    const quiz = new QuizModel(data);
    const saved = await quiz.save();
    return saved.id;
  },

  async getByLesson(lesson_id) {
    const quizzes = await QuizModel.find({ lesson_id, is_final: false }).sort({ created_at: 1 }).lean();
    return quizzes.map(q => ({ ...q, id: q._id.toString() }));
  },

  async getById(id) {
    const quiz = await QuizModel.findById(id).lean();
    if (!quiz) return null;
    return { ...quiz, id: quiz._id.toString() };
  },

  async update(id, data) {
    const result = await QuizModel.findByIdAndUpdate(id, data, { new: true });
    return !!result;
  },

  async delete(id) {
    const result = await QuizModel.findByIdAndDelete(id);
    return !!result;
  },

  async getFinalQuizByCourse(course_id) {
    const quizzes = await QuizModel.find({ course_id, is_final: true }).sort({ created_at: 1 }).lean();
    return quizzes.map(q => ({ ...q, id: q._id.toString() }));
  },

  async saveResult({ user_id, course_id, score, passed }) {
    const status = passed ? 'passed' : 'failed';
    const result = await QuizResultModel.findOne({ user_id, course_id });

    if (result) {
      result.attempts_count += 1;
      result.best_score = Math.max(result.best_score, score);
      if (status === 'passed') result.status = 'passed';
      result.updated_at = Date.now();
      await result.save();
      return { attempts: result.attempts_count, status: result.status };
    } else {
      const newResult = new QuizResultModel({
        user_id,
        course_id,
        attempts_count: 1,
        best_score: score,
        status
      });
      await newResult.save();
      return { attempts: 1, status };
    }
  },

  async getResult(user_id, course_id) {
    const result = await QuizResultModel.findOne({ user_id, course_id }).lean();
    return result ? { ...result, id: result._id.toString() } : null;
  },

  async grantExtraAttempt(user_id, course_id) {
    const result = await QuizResultModel.findOne({ user_id, course_id });
    if (result && result.attempts_count > 0) {
      result.attempts_count -= 1;
      await result.save();
      return true;
    }
    return false;
  }
};

module.exports = Quiz;
