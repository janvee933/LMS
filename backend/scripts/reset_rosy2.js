const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/user');
const axios = require('axios');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.update('69f64017d2f0b6efb1b0c90b', { password: '123' });
    
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'rosy@gmail.com',
      password: '123'
    });
    
    const token = loginRes.data.token;
    console.log("Got token:", token);
    
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
