const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

doubtSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const DoubtModel = mongoose.model('Doubt', doubtSchema);

const Doubt = {
  async create(data) {
    const doubt = new DoubtModel(data);
    const saved = await doubt.save();
    return saved.id;
  },

  async getByInstructor(instructor_id) {
    return await DoubtModel.find({ instructor_id })
      .populate('user_id', 'name email phone')
      .populate('course_id', 'title')
      .sort({ created_at: -1 })
      .lean();
  },

  async getAllAdmin() {
    return await DoubtModel.find()
      .populate('user_id', 'name email phone')
      .populate('course_id', 'title')
      .populate('instructor_id', 'name email')
      .sort({ created_at: -1 })
      .lean();
  },

  async updateStatus(id, status) {
    return await DoubtModel.findByIdAndUpdate(id, { status }, { new: true });
  }
};

module.exports = Doubt;
