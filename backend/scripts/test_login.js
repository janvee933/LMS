const axios = require('axios');

const test = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'rosy@gmail.com',
      password: '123'
    });
    console.log("Login successful! Token:", res.data.token.substring(0, 20) + "...");
    process.exit(0);
  } catch(e) {
    console.error("Login failed:", e.response ? e.response.data : e.message);
    process.exit(1);
  }
}
test();
