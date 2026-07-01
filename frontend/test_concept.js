const axios = require('axios');

async function run() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:8081/api/auth/login', {
      email: 'admin@dsaroadmap.com',
      password: 'Admin123'
    });
    const token = loginRes.data.token;
    console.log('Got token:', token.substring(0, 20) + '...');

    // 2. Create concept
    const conceptRes = await axios.post('http://localhost:8081/api/concepts', {
      name: 'TestingNode',
      category: 'LEARN'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Created concept:', conceptRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
run();
