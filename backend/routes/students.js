const express = require('express');
const { body, validationResult } = require('express-validator');
const SimpleStudent = require('../models/SimpleStudent');
const SimpleUser = require('../models/SimpleUser');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students (Admin/Teacher) or own profile (Student)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let students;
    
    if (req.user.role === 'admin' || req.user.role === 'teacher') {
      // Admin and teachers can see all students
      students = await Student.find({})
        .populate('user', 'name email role isActive')
        .populate('academic.advisor', 'name email');
    } else if (req.user.role === 'student') {
      // Students can only see their own profile
      const student = await Student.findOne({ user: req.user._id })
        .populate('user', 'name email role isActive')
        .populate('academic.advisor', 'name email');
      
      if (!student) {
        return res.status(404).json({ 
          success: false,
          message: 'Student profile not found' 
        });
      }
      
      students = [student];
    } else {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access student data' 
      });
    }

    res.json({
      success: true,
      count: students.length,
      data: students
    });
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
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email role isActive')
      .populate('academic.advisor', 'name email');
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Check if user can access this student
    if (req.user.role !== 'admin' && 
        req.user.role !== 'teacher' && 
        student.user._id.toString() !== req.user._id.toString()) {
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
  body('studentId').trim().isLength({ min: 3 }).withMessage('Student ID must be at least 3 characters'),
  body('course').trim().isLength({ min: 2 }).withMessage('Course must be at least 2 characters'),
  body('year').isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']).withMessage('Invalid year'),
  body('semester').isIn(['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester']).withMessage('Invalid semester'),
  body('userId').optional().isMongoId().withMessage('Invalid user ID')
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

    const { name, email, studentId, course, year, semester, userId, ...otherData } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { studentId }] 
    });
    if (existingStudent) {
      return res.status(400).json({ 
        success: false,
        message: 'Student already exists with this email or student ID' 
      });
    }

    let user;
    if (userId) {
      // Use existing user
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: 'defaultPassword123', // Default password, should be changed
        role: 'student'
      });
    }

    // Create student profile
    const student = await Student.create({
      name,
      email,
      studentId,
      course,
      year,
      semester,
      user: user._id,
      ...otherData
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('user', 'name email role isActive')
      .populate('academic.advisor', 'name email');

    res.status(201).json({
      success: true,
      data: populatedStudent
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
  body('course').optional().trim().isLength({ min: 2 }).withMessage('Course must be at least 2 characters'),
  body('year').optional().isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']).withMessage('Invalid year'),
  body('semester').optional().isIn(['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester']).withMessage('Invalid semester'),
  body('status').optional().isIn(['active', 'inactive', 'graduated', 'suspended']).withMessage('Invalid status'),
  body('gpa').optional().isFloat({ min: 0, max: 4.0 }).withMessage('GPA must be between 0 and 4.0')
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

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Check if user can update this student
    if (req.user.role !== 'admin' && 
        req.user.role !== 'teacher' && 
        student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this student' 
      });
    }

    // Only admin can update certain fields
    const restrictedFields = ['status', 'gpa', 'graduationDate'];
    const updateData = { ...req.body };
    
    if (req.user.role !== 'admin') {
      restrictedFields.forEach(field => {
        delete updateData[field];
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('user', 'name email role isActive')
     .populate('academic.advisor', 'name email');

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
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Delete associated user if it's a student role
    const user = await User.findById(student.user);
    if (user && user.role === 'student') {
      await User.findByIdAndDelete(student.user);
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/students/stats/overview
// @desc    Get student statistics (Admin/Teacher only)
// @access  Private/Admin/Teacher
router.get('/stats/overview', [protect, authorize('admin', 'teacher')], async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const graduatedStudents = await Student.countDocuments({ status: 'graduated' });
    const suspendedStudents = await Student.countDocuments({ status: 'suspended' });

    // Get students by year
    const studentsByYear = await Student.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get students by course
    const studentsByCourse = await Student.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        graduatedStudents,
        suspendedStudents,
        studentsByYear,
        studentsByCourse
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;