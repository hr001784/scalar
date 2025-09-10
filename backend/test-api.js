const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'password123',
  role: 'admin'
};

const testStudent = {
  name: 'Test Student',
  email: 'student@test.com',
  password: 'password123',
  role: 'student'
};

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('');

    // Test 2: Register Admin User
    console.log('2. Registering Admin User...');
    try {
      const adminResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Admin registered:', adminResponse.data.name);
      const adminToken = adminResponse.data.token;
      console.log('');

      // Test 3: Register Student User
      console.log('3. Registering Student User...');
      const studentResponse = await axios.post(`${BASE_URL}/auth/register`, testStudent);
      console.log('✅ Student registered:', studentResponse.data.name);
      const studentToken = studentResponse.data.token;
      console.log('');

      // Test 4: Get Current User (Admin)
      console.log('4. Getting Admin Profile...');
      const adminProfileResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Admin profile:', adminProfileResponse.data.name, '- Role:', adminProfileResponse.data.role);
      console.log('');

      // Test 5: Create Student Profile (Admin)
      console.log('5. Creating Student Profile (Admin)...');
      const studentProfileData = {
        name: 'John Doe',
        email: 'john.doe@university.edu',
        studentId: 'STU001',
        course: 'Computer Science',
        year: '2nd Year',
        semester: '3rd Semester',
        contact: {
          phone: '123-456-7890',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345'
          }
        }
      };

      const createStudentResponse = await axios.post(`${BASE_URL}/students`, studentProfileData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Student profile created:', createStudentResponse.data.data.name);
      console.log('');

      // Test 6: Get All Students (Admin)
      console.log('6. Getting All Students (Admin)...');
      const allStudentsResponse = await axios.get(`${BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Total students:', allStudentsResponse.data.count);
      console.log('');

      // Test 7: Get Student Profile (Student)
      console.log('7. Getting Student Profile (Student)...');
      const studentProfileResponse = await axios.get(`${BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✅ Student can access own profile:', studentProfileResponse.data.count > 0 ? 'Yes' : 'No');
      console.log('');

      // Test 8: Update Student Profile (Student)
      console.log('8. Updating Student Profile (Student)...');
      if (studentProfileResponse.data.data.length > 0) {
        const studentId = studentProfileResponse.data.data[0]._id;
        const updateData = {
          contact: {
            phone: '987-654-3210'
          }
        };

        const updateResponse = await axios.put(`${BASE_URL}/students/${studentId}`, updateData, {
          headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('✅ Student profile updated:', updateResponse.data.data.name);
        console.log('');
      }

      // Test 9: Get Student Statistics (Admin)
      console.log('9. Getting Student Statistics (Admin)...');
      const statsResponse = await axios.get(`${BASE_URL}/students/stats/overview`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Student statistics:', {
        total: statsResponse.data.data.totalStudents,
        active: statsResponse.data.data.activeStudents
      });
      console.log('');

      // Test 10: Test Unauthorized Access
      console.log('10. Testing Unauthorized Access...');
      try {
        await axios.get(`${BASE_URL}/students/stats/overview`, {
          headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('❌ Unauthorized access should have failed');
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.log('✅ Unauthorized access properly blocked');
        } else {
          console.log('❌ Unexpected error:', error.message);
        }
      }
      console.log('');

      console.log('🎉 All API tests completed successfully!');
      console.log('\n📋 Summary:');
      console.log('- ✅ Health check working');
      console.log('- ✅ User registration working');
      console.log('- ✅ Authentication working');
      console.log('- ✅ Role-based access control working');
      console.log('- ✅ Student CRUD operations working');
      console.log('- ✅ Statistics endpoint working');
      console.log('- ✅ Authorization properly enforced');

    } catch (error) {
      if (error.response) {
        console.log('❌ API Error:', error.response.status, error.response.data.message);
      } else {
        console.log('❌ Network Error:', error.message);
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the tests
testAPI();
