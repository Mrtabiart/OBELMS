
const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Department name is required"],
    trim: true
  },
  hodName: {
    type: String,
    required: [true, "HOD name is required"],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}); 

module.exports = mongoose.model("department", DepartmentSchema);