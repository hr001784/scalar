const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MongoDB Atlas cloud database for demo
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.mongodb.net/student_management?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Starting server without database connection...');
    // Don't exit, let the server start without DB for demo
  }
};

module.exports = connectDB;
