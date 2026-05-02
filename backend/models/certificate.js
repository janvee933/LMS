const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificate_id: { type: String, required: true, unique: true },
  issued_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

certificateSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

const CertificateModel = mongoose.model('Certificate', certificateSchema);

const Certificate = {
  async issue(user_id, course_id, certificate_id) {
    return await CertificateModel.findOneAndUpdate(
      { user_id, course_id },
      { certificate_id, issued_at: Date.now() },
      { upsert: true, new: true }
    );
  },

  async getByUser(user_id) {
    const certs = await CertificateModel.find({ user_id })
      .populate('course_id', 'title thumbnail')
      .lean();
    
    return certs.map(c => ({
      ...c,
      id: c._id.toString(),
      course_title: c.course_id?.title,
      course_thumbnail: c.course_id?.thumbnail
    }));
  },

  async getByUserAndCourse(user_id, course_id) {
    const cert = await CertificateModel.findOne({ user_id, course_id }).lean();
    return cert ? { ...cert, id: cert._id.toString() } : null;
  }
};

module.exports = Certificate;

