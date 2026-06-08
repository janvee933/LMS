const axios = require('axios');

const test = async () => {
  try {
    const res = await axios.post('https://lms-awza.onrender.com/api/auth/login', {
      email: 'rosy@gmail.com',
      password: '123'
    });
    console.log("Render Login successful! Token:", res.data.token.substring(0, 20) + "...");
    process.exit(0);
  } catch(e) {
    console.error("Render Login failed:", e.response ? e.response.data : e.message);
    
    // Try admin
    try {
      const res2 = await axios.post('https://lms-awza.onrender.com/api/auth/login', {
        email: 'admin@lms.com',
        password: '123'
      });
      console.log("Render Admin Login successful! Token:", res2.data.token.substring(0, 20) + "...");
    } catch (e2) {
      console.error("Render Admin Login failed:", e2.response ? e2.response.data : e2.message);
    }
    
    process.exit(1);
  }
}
test();
