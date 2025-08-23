const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, "Program ID is required"]
  }
}, { _id: false });

const semesterSchema = new mongoose.Schema({
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, "Semester ID is required"]
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, "Subject ID is required"]
  }]
}, { _id: false });

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Teacher name is required"],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    required: [true, "Email is required"]
  },
  qualifications: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: null
  },
  programs: [programSchema],
  semesters: [semesterSchema],  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

teacherSchema.index({ name: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Teacher", teacherSchema);
