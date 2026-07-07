const axios = require('axios');
axios.post('http://localhost:8081/api/v1/auth/forgot-password', { email: 'example@gmail.com' })
  .then(res => console.log('Success:', res.data))
  .catch(err => console.log('Error:', err.response ? err.response.data : err.message));
