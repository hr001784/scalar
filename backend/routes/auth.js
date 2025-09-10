const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const SimpleUser = require('../models/SimpleUser');
const { protect } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'student', 'teacher', 'staff']).withMessage('Role must be admin, student, teacher, or staff')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Registration validation failed:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, role = 'student' } = req.body;
    console.log(`Registration attempt - Name: ${name}, Email: ${email}, Role: ${role}`);

    if (!name || !email || !password) {
      console.error('Registration error: Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userModel = new SimpleUser();
    
    // Create user with normalized role (SimpleUser model will normalize)
    const user = await userModel.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      // Ensure role is normalized in the registration response
      console.log(`Registration successful for: ${user.name}, Role: ${user.role}`);
      
      // Send verification email
      try {
        await sendVerificationEmail(user.email, user.name, user.verificationToken);
        console.log(`Verification email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Continue with registration even if email fails
      }
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Already normalized in the SimpleUser model
        isVerified: user.isVerified,
        message: 'Registration successful. Please check your email to verify your account.',
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    // Check for specific error types
    if (error.message === 'User already exists with this email') {
      return res.status(400).json({ message: error.message });
    } else if (error.message === 'Missing required fields') {
      return res.status(400).json({ message: error.message });
    } else {
      return res.status(500).json({ message: 'Server error during registration' });
    }
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    const userModel = new SimpleUser();
    
    // Check for user
    const user = await userModel.findByEmail(email);
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`User found: ${user.name}, Role: ${user.role}`);

    // Check password
    const isMatch = await userModel.comparePassword(user, password);
    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log(`Unverified user attempted login: ${email}`);
      return res.status(401).json({ 
        message: 'Please verify your email before logging in',
        isVerified: false
      });
    }

    console.log(`Login successful for: ${user.name}, Role: ${user.role}`);

    // Ensure role is normalized in the response
    const normalizedRole = user.role.toLowerCase();
    console.log(`Sending login response with normalized role: ${normalizedRole}`);
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: normalizedRole, // Use normalized role in response
      isVerified: user.isVerified,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const userModel = new SimpleUser();
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user email
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const userModel = new SimpleUser();
    const user = await userModel.verifyEmail(req.params.token);
    
    res.status(200).json({
      message: 'Email verified successfully. You can now log in.',
      isVerified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ message: error.message || 'Email verification failed' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email } = req.body;
    const userModel = new SimpleUser();
    
    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link' 
      });
    }

    // Generate reset token
    const resetToken = await userModel.generatePasswordResetToken(email);
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({ message: 'Error sending password reset email' });
    }
    
    res.status(200).json({ 
      message: 'If your email is registered, you will receive a password reset link' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { password } = req.body;
    const { token } = req.params;
    
    const userModel = new SimpleUser();
    await userModel.resetPassword(token, password);
    
    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: error.message || 'Password reset failed' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', [
  protect,
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userModel = new SimpleUser();
    
    await userModel.changePassword(req.user._id, currentPassword, newPassword);
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email } = req.body;
    const userModel = new SimpleUser();
    
    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered and not verified, you will receive a verification email' 
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new verification token
    const userIndex = userModel.data.users.findIndex(u => u._id === user._id);
    if (userIndex !== -1) {
      userModel.data.users[userIndex].verificationToken = verificationToken;
      userModel.data.users[userIndex].verificationExpires = verificationExpires.toISOString();
      userModel.data.users[userIndex].updatedAt = new Date().toISOString();
      userModel.saveData();

      // Send verification email
      try {
        await sendVerificationEmail(user.email, user.name, verificationToken);
        console.log(`Verification email resent to: ${user.email}`);
      } catch (emailError) {
        console.error('Error resending verification email:', emailError);
        return res.status(500).json({ message: 'Error sending verification email' });
      }
    }
    
    res.status(200).json({ 
      message: 'If your email is registered and not verified, you will receive a verification email' 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
