const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testApi = async () => {
  try {
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
testApi();
