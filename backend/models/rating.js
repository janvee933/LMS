const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  created_at: { type: Date, default: Date.now }
});

ratingSchema.index({ course_id: 1, user_id: 1 }, { unique: true });

const RatingModel = mongoose.model('CourseRating', ratingSchema);

const Rating = {
  async create({ course_id, user_id, rating, review }) {
    return await RatingModel.findOneAndUpdate(
      { course_id, user_id },
      { rating, review, created_at: Date.now() },
      { upsert: true, new: true }
    );
  },

  async getByCourse(course_id) {
    const ratings = await RatingModel.find({ course_id })
      .populate('user_id', 'name')
      .sort({ created_at: -1 })
      .lean();
    
    return ratings.map(r => ({
      ...r,
      id: r._id.toString(),
      user_name: r.user_id?.name
    }));
  },

  async getAverage(course_id) {
    const stats = await RatingModel.aggregate([
      { $match: { course_id: new mongoose.Types.ObjectId(course_id) } },
      { $group: { _id: '$course_id', avg_rating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    return {
      avg_rating: stats[0]?.avg_rating || 0,
      count: stats[0]?.count || 0
    };
  },

  async getUserRating(course_id, user_id) {
    const rating = await RatingModel.findOne({ course_id, user_id }).lean();
    return rating ? { ...rating, id: rating._id.toString() } : null;
  }
};

module.exports = Rating;

