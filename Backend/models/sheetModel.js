const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name: String,       
  marksObtained: Number,
  totalMarks: Number
}, { _id: false });

const CLOSchema = new mongoose.Schema({
  cloId: String,       
  fields: [FieldSchema],
  kpi: Number           
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  name: String,
  rollnumber: String, 
  clos: [CLOSchema],
  plos: {
    plo1: Number,
    plo2: Number,
    plo3: Number
  }
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
