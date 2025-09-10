# Student Management System

A full-stack MERN application with authentication, role-based access control, and student management functionality.

## Features

- **Authentication**: JWT-based login/signup with bcrypt password hashing
- **Role-based Access**: Admin and Student roles with different permissions
- **Admin Dashboard**: 
  - View all students
  - Add/Edit/Delete student records
- **Student Dashboard**: 
  - View own profile
  - Update profile information
- **Protected Routes**: Secure access based on authentication and roles

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Database**: MongoDB

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd student-management-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student_management
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017`

## Running the Application

### Development Mode (Both Frontend and Backend)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Running Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Students
- `GET /api/students` - Get students (all for admin, own for student)
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create student (admin only)
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (admin only)

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Admin Access**: 
   - Register with role "admin" or change user role in database
   - Access admin dashboard to manage all students
3. **Student Access**: 
   - Register with role "student" (default)
   - View and update own profile

## Default Admin Account

To create an admin account, you can either:
1. Register with role "admin" during signup
2. Or manually update a user's role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" }, 
     { $set: { role: "admin" } }
   )
   ```

## Project Structure

```
student-management-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── students.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
```

## Deployment

### Backend Deployment (Heroku)

1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy backend code
4. Update frontend API calls to use Heroku URL

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend: `npm run build`
2. Deploy the `build` folder
3. Update API endpoints to production URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
