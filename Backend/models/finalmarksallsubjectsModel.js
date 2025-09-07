const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true },      // e.g., assignment, quiz, mid, final
  weightage: { type: Number, required: true }  // % weight
});

const CloSchema = new mongoose.Schema({
  cloKey: { type: String, required: true },   // e.g., "clo1", "clo2"
  cloNumber: { type: Number, required: true },// e.g., 1, 2
  ploNumber: { type: Number, required: true },// linked PLO number
  cloId: { type: String, required: true },    // unique ID for CLO
  fields: [FieldSchema],                      // dynamic fields with weightages
  totalMarks: {                               // max marks for each field
    type: Map,
    of: String,
    default: {}
  }
});

const StudentMarksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Student's ID
  studentName: { type: String, required: true }, // Student's name
  rollNumber: { type: String, required: true },  // Student's roll number
  email: { type: String, required: true },       // Student's email
  marks: {                                       // CLO-wise marks
    type: Map,
    of: new mongoose.Schema({
      kpi: { type: String, default: '' },       // KPI percentage string
      fields: {
        type: Map,
        of: String                              // fieldName → obtained marks
      }
    }),
    default: {}
  }
});

const SubjectSheetSchema = new mongoose.Schema({
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', required: true }, // ✅ Fixed: lowercase 'subject'
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },

  cloToPloMapping: {
    type: Map,
    of: String,                                // e.g., clo1 → "PLO 1"
    default: {}
  },

  cloDetails: {
    type: Map,
    of: CloSchema,                             // detailed CLO structure
    default: {}
  },

  students: [StudentMarksSchema],              // all students with their marks

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
SubjectSheetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SubjectSheet', SubjectSheetSchema);
