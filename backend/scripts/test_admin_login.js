const axios = require('axios');

const test = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@lms.com',
      password: 'admin123'
    });
    console.log('Login successful! Token:', res.data.token.substring(0, 20) + '...');
    process.exit(0);
  } catch(e) {
    console.error('Test failed:', e.response ? e.response.data : e.message);
    process.exit(1);
  }
}
test();
