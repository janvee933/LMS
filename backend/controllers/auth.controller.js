const User = require('../models/user');
const { generateToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findByEmail(email);
    if (userExists) {
      console.log('Signup failed: User already exists for email', email);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const userId = await User.create({ name, email, password, phone, role });
    const user = await User.findById(userId);
    const token = generateToken(user.id);

    // Set cookie (7 days matching JWT)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7days
      path: '/',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const logLine = `\n--- LOGIN ATTEMPT --- Email: ${email}, Password tried: ${password}\n`;
    console.log(logLine);
    require('fs').appendFileSync('login_attempts.log', logLine);

    const user = await User.findByEmail(email);
    if (!user) {
      console.log('Login failed: User not found for email', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch for email', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    console.log('Login SUCCESS for email', email);

    const token = generateToken(user.id);

    // Set cookie (7 days matching JWT)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    console.log(`Login successful: ${email} (${user.role})`);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is trying to delete themselves
    if (id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account' });
    }

    const deleted = await User.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const userId = await User.create({ name, email, password, phone, role });
    const user = await User.findById(userId);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { signup, login, getMe, logout, listUsers, deleteUser, createUser };
