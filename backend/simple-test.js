const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function simpleTest() {
  console.log('🧪 Running Simple API Test...\n');

  try {
    // Test 1: Health Check
    console.log('1. Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running\n');

    // Test 2: Register a user
    console.log('2. Registering user...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ User registered:', registerResponse.data.name);
    console.log('✅ Token received:', registerResponse.data.token ? 'Yes' : 'No');
    console.log('✅ Role:', registerResponse.data.role);
    console.log('');

    // Test 3: Login
    console.log('3. Testing login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.name);
    console.log('✅ New token received:', loginResponse.data.token ? 'Yes' : 'No');
    console.log('');

    // Test 4: Get profile
    console.log('4. Getting user profile...');
    const token = loginResponse.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.name);
    console.log('✅ User ID:', profileResponse.data._id);
    console.log('✅ Role:', profileResponse.data.role);
    console.log('');

    console.log('🎉 Basic API functionality is working!');
    console.log('\n📋 System Status:');
    console.log('- ✅ Server running');
    console.log('- ✅ User registration working');
    console.log('- ✅ User login working');
    console.log('- ✅ JWT authentication working');
    console.log('- ✅ Profile retrieval working');
    console.log('- ✅ Role-based system ready');

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('Validation errors:', error.response.data.errors);
    }
  }
}

simpleTest();
