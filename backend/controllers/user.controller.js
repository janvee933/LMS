const User = require('../models/user');
const bcrypt = require('bcryptjs');

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    // If email is changing, check if new email already exists
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && String(existingUser._id) !== String(userId)) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const updateData = { name, email, phone };
    
    // Handle profile image if uploaded
    if (req.file) {
      updateData.profile_image = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.update(userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profile_image: updatedUser.profile_image,
        settings: updatedUser.settings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    await User.update(userId, { password: newPassword });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { email_notifications } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.update(userId, {
      'settings.email_notifications': email_notifications
    });

    res.status(200).json({ 
      success: true, 
      message: 'Settings updated', 
      settings: updatedUser.settings 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLoginActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user.login_activity || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  updateProfile,
  changePassword,
  updateSettings,
  getLoginActivity
};
