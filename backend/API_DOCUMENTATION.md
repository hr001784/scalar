# Student Management System API Documentation

## Overview
This API provides comprehensive role-based access control for a student management system with the following roles:
- **Admin**: Full access to all resources
- **Teacher**: Access to student data and management
- **Student**: Access to own profile only
- **Staff**: Limited access (can be extended as needed)

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
http://localhost:5000/api
```

## User Model
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars),
  role: String (enum: ['admin', 'student', 'teacher', 'staff'], default: 'student'),
  isVerified: Boolean (default: true),
  isActive: Boolean (default: true),
  lastLogin: Date,
  profile: {
    phone: String,
    address: String,
    dateOfBirth: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Student Model
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  studentId: String (required, unique, min 3 chars),
  course: String (required, 2-100 chars),
  year: String (enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']),
  semester: String (enum: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester']),
  enrollmentDate: Date (default: now),
  graduationDate: Date,
  status: String (enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active'),
  gpa: Number (0-4.0, default: 0),
  contact: {
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String (default: 'USA')
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
    advisor: ObjectId (ref: 'User')
  },
  user: ObjectId (ref: 'User', required),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/register`
Register a new user
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student" // optional, default: 'student'
  }
  ```
- **Response**:
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "token": "jwt_token"
  }
  ```

#### POST `/login`
Login user
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "token": "jwt_token"
  }
  ```

#### GET `/me`
Get current user profile
- **Access**: Private
- **Response**: User object without password

#### POST `/logout`
Logout user
- **Access**: Private
- **Response**: Success message

### User Management Routes (`/api/users`)

#### GET `/`
Get all users
- **Access**: Admin only
- **Response**:
  ```json
  {
    "success": true,
    "count": 10,
    "data": [User objects]
  }
  ```

#### GET `/:id`
Get single user
- **Access**: Private (own profile or admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": User object
  }
  ```

#### PUT `/:id`
Update user
- **Access**: Private (own profile or admin)
- **Body**: Partial user object
- **Response**: Updated user object

#### DELETE `/:id`
Delete user
- **Access**: Admin only
- **Response**: Success message

#### PUT `/:id/status`
Update user status
- **Access**: Admin only
- **Body**:
  ```json
  {
    "isActive": true
  }
  ```

### Student Management Routes (`/api/students`)

#### GET `/`
Get students
- **Access**: 
  - Admin/Teacher: All students
  - Student: Own profile only
- **Response**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [Student objects with populated user and advisor]
  }
  ```

#### GET `/:id`
Get single student
- **Access**: Private (own profile, admin, or teacher)
- **Response**: Student object with populated references

#### POST `/`
Create new student
- **Access**: Admin only
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "studentId": "STU001",
    "course": "Computer Science",
    "year": "2nd Year",
    "semester": "3rd Semester",
    "userId": "optional_user_id"
  }
  ```

#### PUT `/:id`
Update student
- **Access**: 
  - Student: Own profile (limited fields)
  - Admin/Teacher: All fields
- **Body**: Partial student object
- **Restricted fields for students**: status, gpa, graduationDate

#### DELETE `/:id`
Delete student
- **Access**: Admin only
- **Response**: Success message

#### GET `/stats/overview`
Get student statistics
- **Access**: Admin/Teacher only
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalStudents": 100,
      "activeStudents": 85,
      "graduatedStudents": 10,
      "suspendedStudents": 5,
      "studentsByYear": [...],
      "studentsByCourse": [...]
    }
  }
  ```

## Role-Based Access Control

### Admin
- Full access to all endpoints
- Can create, read, update, delete users and students
- Can manage user roles and status
- Can view statistics and reports

### Teacher
- Can view all students
- Can update student academic information
- Can view statistics
- Cannot delete users or students
- Cannot change user roles

### Student
- Can view and update own profile only
- Cannot access other students' data
- Cannot view statistics
- Cannot perform administrative actions

### Staff
- Limited access (can be extended based on requirements)
- Currently same as student access

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [validation errors] // optional
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: Bcrypt for password security
3. **Role-Based Access**: Granular permissions based on user roles
4. **Input Validation**: Comprehensive validation using express-validator
5. **CORS**: Cross-origin resource sharing enabled
6. **Error Handling**: Centralized error handling middleware

## Database

The system uses MongoDB with Mongoose ODM. The database connection is configured in `config/database.js` and supports both local and cloud MongoDB instances.

## Environment Variables

Required environment variables:
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/student_management
```
