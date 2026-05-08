const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  profile_image: { type: String },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  settings: {
    email_notifications: { type: Boolean, default: true }
  },
  login_activity: [
    {
      device: String,
      ip: String,
      last_login: { type: Date, default: Date.now }
    }
  ],
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id to maintain compatibility with existing controllers
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const UserModel = mongoose.model('User', userSchema);

const User = {
  async create({ name, email, password, phone, role }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'student'
    });

    const savedUser = await user.save();
    return savedUser.id;
  },

  async findByEmail(email) {
    return await UserModel.findOne({ email });
  },

  async findById(id) {
    return await UserModel.findById(id);
  },

  async update(id, data) {
    // If password is being updated, hash it
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    const result = await UserModel.findByIdAndUpdate(id, data, { new: true });
    return result;
  },

  async findAll() {
    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'user_id',
          as: 'enrollments'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'instructor_id',
          as: 'created_courses'
        }
      },
      {
        $addFields: {
          id: { $toString: '$_id' },
          enrollment_count: { $size: '$enrollments' },
          created_courses_count: { $size: '$created_courses' }
        }
      },
      {
        $project: {
          enrollments: 0,
          created_courses: 0
        }
      }
    ]);
    return users;
  },

  async findByRole(role) {
    const users = await UserModel.find({ role }).lean();
    return users.map(u => ({ ...u, id: u._id.toString() }));
  },

  async delete(id) {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  },
};

module.exports = User;

