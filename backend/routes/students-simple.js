const express = require('express');
const { body, validationResult } = require('express-validator');
const SimpleStudent = require('../models/SimpleStudent');
const SimpleUser = require('../models/SimpleUser');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students (Admin) or own profile (Student)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const studentModel = new SimpleStudent();
    
    if (req.user.role === 'admin') {
      // Admin can see all students
      const students = studentModel.findAll();
      res.json({
        success: true,
        count: students.length,
        data: students
      });
    } else if (req.user.role === 'student') {
      // Student can only see their own profile
      const student = studentModel.findByUserId(req.user._id);
      if (!student) {
        return res.status(404).json({ 
          success: false,
          message: 'Student profile not found' 
        });
      }
      res.json({
        success: true,
        count: 1,
        data: [student]
      });
    } else {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access student data' 
      });
    }
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const studentModel = new SimpleStudent();
    const student = studentModel.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Check if user can access this student
    if (req.user.role !== 'admin' && student.user !== req.user._id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access this student' 
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   POST /api/students
// @desc    Create new student (Admin only)
// @access  Private/Admin
router.post('/', [
  protect,
  authorize('admin'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('course').trim().isLength({ min: 2 }).withMessage('Course must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, course } = req.body;

    const userModel = new SimpleUser();
    const studentModel = new SimpleStudent();

    // Check if user exists
    let user = await userModel.findByEmail(email);
    if (!user) {
      // Create user if doesn't exist
      user = await userModel.create({
        name,
        email,
        password: 'defaultPassword123', // Default password, should be changed
        role: 'student'
      });
    } else if (user.role !== 'student') {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists with different role' 
      });
    }

    // Check if student profile already exists
    const existingStudent = studentModel.findByUserId(user._id);
    if (existingStudent) {
      return res.status(400).json({ 
        success: false,
        message: 'Student profile already exists for this user' 
      });
    }

    // Create student profile
    const student = studentModel.create({
      name,
      email,
      course,
      user: user._id
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private
router.put('/:id', [
  protect,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('course').optional().trim().isLength({ min: 2 }).withMessage('Course must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const studentModel = new SimpleStudent();
    
    const student = studentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Check if user can update this student
    if (req.user.role !== 'admin' && student.user !== req.user._id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this student' 
      });
    }

    const { name, email, course } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (course) updateData.course = course;

    const updatedStudent = studentModel.update(req.params.id, updateData);

    res.json({
      success: true,
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student (Admin only)
// @access  Private/Admin
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const studentModel = new SimpleStudent();
    const student = studentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    const deleted = studentModel.delete(req.params.id);
    if (deleted) {
      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: 'Failed to delete student' 
      });
    }
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
