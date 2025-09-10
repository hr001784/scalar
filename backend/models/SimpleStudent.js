const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/database.json');

class SimpleStudent {
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

  create(studentData) {
    const { name, email, course, user } = studentData;
    
    // Check if student already exists
    const existingStudent = this.data.students.find(student => student.email === email);
    if (existingStudent) {
      throw new Error('Student already exists with this email');
    }

    const student = {
      _id: Date.now().toString(),
      name,
      email,
      course,
      user,
      enrollmentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.students.push(student);
    this.saveData();
    
    return student;
  }

  findById(id) {
    return this.data.students.find(student => student._id === id) || null;
  }

  findByUserId(userId) {
    return this.data.students.find(student => student.user === userId) || null;
  }

  findAll() {
    return this.data.students;
  }

  update(id, updateData) {
    const studentIndex = this.data.students.findIndex(student => student._id === id);
    if (studentIndex === -1) {
      return null;
    }

    this.data.students[studentIndex] = {
      ...this.data.students[studentIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.saveData();
    return this.data.students[studentIndex];
  }

  delete(id) {
    const studentIndex = this.data.students.findIndex(student => student._id === id);
    if (studentIndex === -1) {
      return false;
    }

    this.data.students.splice(studentIndex, 1);
    this.saveData();
    return true;
  }
}

module.exports = SimpleStudent;
