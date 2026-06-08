const axios = require('axios');

const test = async () => {
  try {
    const email = `test${Date.now()}@test.com`;
    console.log('Signing up:', email);
    await axios.post('http://localhost:5000/api/auth/signup', {
      name: 'Test',
      email: email,
      password: 'mypassword',
      phone: '1234567890',
      role: 'student'
    });
    
    console.log('Signup successful. Logging in...');
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: email,
      password: 'mypassword'
    });
    console.log('Login successful! Token:', res.data.token.substring(0, 20) + '...');
    process.exit(0);
  } catch(e) {
    console.error('Test failed:', e.response ? e.response.data : e.message);
    process.exit(1);
  }
}
test();
