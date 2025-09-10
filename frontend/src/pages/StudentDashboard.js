import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import ChangePassword from '../components/ChangePassword';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    enrollmentDate: new Date().toISOString()
  });

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await axios.get('/api/students');
      if (response.data.data && response.data.data.length > 0) {
        const studentData = response.data.data[0];
        setStudent(studentData);
        setFormData({
          name: studentData.name,
          email: studentData.email,
          course: studentData.course,
          enrollmentDate: studentData.enrollmentDate || new Date().toISOString()
        });
      } else {
        setError('Student profile not found. Please contact an administrator.');
      }
    } catch (error) {
      setError('Failed to fetch student profile');
      console.error('Fetch student error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(`/api/students/${student._id}`, formData);
      setStudent(response.data);
      setEditing(false);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course,
      enrollmentDate: student.enrollmentDate || new Date().toISOString()
    });
    setEditing(false);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!student) {
    return (
      <div className="card">
        <h2>Student Profile Not Found</h2>
        <p>Your student profile has not been created yet. Please contact an administrator.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Student Dashboard</h1>
          <p className="text-muted">Welcome, {user?.name}</p>
        </div>
        {student && (
          <button 
            className="btn btn-primary"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-body">
          <h3>Student Profile</h3>
          
          {!editing && student && (
            <div className="mb-4">
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Email:</strong> {student.email}</p>
              
              <div className="course-card">
                <div className="course-title">Course Information</div>
                <div className="course-details">
                  <div className="course-detail-item">
                    <span className="course-detail-label">Course Name:</span>
                    <span className="course-detail-value">{student.course}</span>
                  </div>
                  <div className="course-detail-item">
                    <span className="course-detail-label">Enrolled On:</span>
                    <span className="course-detail-value">
                      {student.enrollmentDate ? 
                        format(new Date(student.enrollmentDate), 'MMMM dd, yyyy') : 
                        'Not available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="course">Course</label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  className="form-control"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  placeholder="e.g., MERN Bootcamp"
                />
              </div>

              <div className="mt-4">
                <button type="submit" className="btn btn-success me-2">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="row">
              <div className="col-md-6">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Email:</strong> {student.email}</p>
                
                <div className="course-card">
                  <div className="course-title">Course Information</div>
                  <div className="course-details">
                    <div className="course-detail-item">
                      <span className="course-detail-label">Course Name:</span>
                      <span className="course-detail-value">{student.course}</span>
                    </div>
                    <div className="course-detail-item">
                      <span className="course-detail-label">Enrolled On:</span>
                      <span className="course-detail-value">
                        {student.enrollmentDate ? 
                          format(new Date(student.enrollmentDate), 'MMM dd, yyyy') : 
                          'Not available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <ChangePassword />
      </div>
    </div>
  );
};

export default StudentDashboard;
