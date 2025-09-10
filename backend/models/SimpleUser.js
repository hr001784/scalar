const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const dataPath = path.join(__dirname, '../data/database.json');

class SimpleUser {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return { users: [], students: [] };
    }
  }

  saveData() {
    fs.writeFileSync(dataPath, JSON.stringify(this.data, null, 2));
  }

  async create(userData) {
    try {
      const { name, email, password, role = 'student' } = userData;
      
      if (!name || !email || !password) {
        console.error('Registration error: Missing required fields');
        throw new Error('Missing required fields');
      }
      
      // Check if user already exists
      const existingUser = this.data.users.find(user => user.email === email);
      if (existingUser) {
        console.error('Registration error: User already exists with this email');
        throw new Error('User already exists with this email');
      }

      // Normalize role to lowercase for consistency
      const normalizedRole = role ? role.toLowerCase() : 'student';
      console.log(`Creating user with normalized role: ${normalizedRole}`);

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token
      const verificationToken = crypto.randomBytes(20).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = {
        _id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        role: normalizedRole, // Store normalized role
        isVerified: false,
        verificationToken,
        verificationExpires: verificationExpires.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.data.users.push(user);
      this.saveData();
      
      console.log(`User created successfully: ${user.name}, Role: ${user.role}`);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      };
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  }

  async findByEmail(email) {
    return this.data.users.find(user => user.email === email) || null;
  }

  async findById(id) {
    return this.data.users.find(user => user._id === id) || null;
  }

  async comparePassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  async verifyEmail(token) {
    const user = this.data.users.find(
      user => user.verificationToken === token && new Date(user.verificationExpires) > new Date()
    );

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user verification status
    const userIndex = this.data.users.findIndex(u => u._id === user._id);
    if (userIndex !== -1) {
      this.data.users[userIndex].isVerified = true;
      this.data.users[userIndex].verificationToken = undefined;
      this.data.users[userIndex].verificationExpires = undefined;
      this.data.users[userIndex].updatedAt = new Date().toISOString();
      this.saveData();
      return this.data.users[userIndex];
    }

    throw new Error('User not found');
  }

  async generatePasswordResetToken(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found with this email');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    const userIndex = this.data.users.findIndex(u => u._id === user._id);
    if (userIndex !== -1) {
      this.data.users[userIndex].resetPasswordToken = resetToken;
      this.data.users[userIndex].resetPasswordExpires = resetExpires.toISOString();
      this.data.users[userIndex].updatedAt = new Date().toISOString();
      this.saveData();
      return resetToken;
    }

    throw new Error('User not found');
  }

  async resetPassword(token, newPassword) {
    const user = this.data.users.find(
      user => user.resetPasswordToken === token && new Date(user.resetPasswordExpires) > new Date()
    );

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    const userIndex = this.data.users.findIndex(u => u._id === user._id);
    if (userIndex !== -1) {
      this.data.users[userIndex].password = hashedPassword;
      this.data.users[userIndex].resetPasswordToken = undefined;
      this.data.users[userIndex].resetPasswordExpires = undefined;
      this.data.users[userIndex].updatedAt = new Date().toISOString();
      this.saveData();
      return this.data.users[userIndex];
    }

    throw new Error('User not found');
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await this.comparePassword(user, currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    const userIndex = this.data.users.findIndex(u => u._id === userId);
    if (userIndex !== -1) {
      this.data.users[userIndex].password = hashedPassword;
      this.data.users[userIndex].updatedAt = new Date().toISOString();
      this.saveData();
      return this.data.users[userIndex];
    }

    throw new Error('User not found');
  }
}

module.exports = SimpleUser;
