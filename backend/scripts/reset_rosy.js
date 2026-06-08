const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/user');
const axios = require('axios');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const u = await User.findOne({email: 'rosy@gmail.com'});
    u.password = bcrypt.hashSync('123', 10);
    await u.save();
    
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'rosy@gmail.com',
      password: '123'
    });
    
    const token = loginRes.data.token;
    const enrollRes = await axios.get('http://localhost:5000/api/enrollments/my-enrollments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(JSON.stringify(enrollRes.data, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
    process.exit(1);
  }
}
test();
