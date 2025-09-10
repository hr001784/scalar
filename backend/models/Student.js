const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  studentId: {
    type: String,
    unique: true,
    required: [true, 'Please provide a student ID'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Please provide a course'],
    trim: true,
    maxlength: [100, 'Course name cannot be more than 100 characters']
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'],
    required: [true, 'Please provide the year of study']
  },
  semester: {
    type: String,
    enum: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'],
    required: [true, 'Please provide the semester']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  graduationDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'suspended'],
    default: 'active'
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0,
    default: 0
  },
  contact: {
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'USA'
      }
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  academic: {
    major: String,
    minor: String,
    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
