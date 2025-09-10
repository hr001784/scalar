import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import ChangePassword from '../components/ChangePassword';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    enrollmentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      console.log('Students API response:', response.data);
      if (response.data && response.data.data) {
        setStudents(response.data.data);
      } else {
        setStudents([]);
        setError('Invalid student data format received');
        console.error('Invalid student data format:', response.data);
      }
    } catch (error) {
      setError('Failed to fetch students');
      console.error('Fetch students error:', error);
      setStudents([]);
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
      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent._id}`, formData);
        setSuccess('Student updated successfully');
      } else {
        await axios.post('/api/students', formData);
        setSuccess('Student added successfully');
      }
      
      setFormData({ 
        name: '', 
        email: '', 
        course: '',
        enrollmentDate: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course,
      enrollmentDate: student.enrollmentDate ? 
        new Date(student.enrollmentDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`/api/students/${id}`);
        setSuccess('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        setError('Failed to delete student');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', course: '' });
    setShowForm(false);
    setEditingStudent(null);
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted">Welcome, {user?.name}</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Student'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {showForm && (
        <div className="card mb-4">
          <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
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

            {!editingStudent && (
              <div className="form-group mb-3">
                <label htmlFor="enrollmentDate">Enrollment Date</label>
                <input
                  type="date"
                  id="enrollmentDate"
                  name="enrollmentDate"
                  className="form-control"
                  value={formData.enrollmentDate}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="d-flex">
              <button type="submit" className="btn btn-success me-2">
                {editingStudent ? 'Update' : 'Add'} Student
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
        </div>
      )}

      <div className="mt-4">
        <ChangePassword />
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h3>Students List</h3>
          {students.length === 0 ? (
            <p>No students found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Enrollment Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.course}</td>
                      <td>
                        {student.enrollmentDate ? 
                          format(new Date(student.enrollmentDate), 'MMM dd, yyyy') : 
                          'Not available'}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
