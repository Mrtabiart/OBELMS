const mongoose = require("mongoose");

const CloSchema = new mongoose.Schema({
  clonumber: {
    type: String,
    required: [true, "CLO number is required"],
    trim: true
  },
  passingPercentage: {
    type: String,
    required: [true, "CLO passing percentage is required"],
    trim: true
  },
  type: {
    type: String,
    required: [true, "CLO type is required"],
   
    trim: true
  },
  description: {
    type: String,
    required: [true, "CLO description is required"],
    trim: true
  },
  ploNumber: {
    type: String,
    required: [true, "PLO number is required"],
    trim: true
  }
});

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subject name is required"],
    trim: true
  },
  code: {
    type: String,
    required: [true, "Subject code is required"],
    trim: true,
    unique: true
  },
  creditHours: {
    type: Number,
    required: [true, "Credit hours are required"],
    min: [1, "Credit hours cannot be less than 1"],
    max: [6, "Credit hours cannot be more than 6"] 
  },
  isLab: {
    type: Boolean,
    default: false
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'program',
    required: [true, "Program ID is required"]
  },
  clos: [CloSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("subject", SubjectSchema);