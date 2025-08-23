const mongoose = require("mongoose");

const PloSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, "PLO number is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "PLO description is required"],
    trim: true
  }
});

const ProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Program name is required"],
    trim: true
  },
  coordinatorName: {
    type: String,
    required: [true, "Coordinator name is required"],
    trim: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'department',
    required: [true, "Department ID is required"]
  },
  plos: [PloSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("program", ProgramSchema);