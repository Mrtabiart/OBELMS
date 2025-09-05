const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  studentid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }
}, { _id: true, timestamps: true });

const courseSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',  
    required: true
  },
  semesterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  }
}, { _id: true, timestamps: true });

const semesterContentSchema = new mongoose.Schema({
  semesterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  courses: [courseSchema],
  students: [studentSchema]
}, { _id: true, timestamps: true });

const semesterSchema = new mongoose.Schema({
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'program',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  session: {
    type: String,
    required: true
  },
  semesterContents: [semesterContentSchema] // Array of semester contents
}, { timestamps: true });

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;