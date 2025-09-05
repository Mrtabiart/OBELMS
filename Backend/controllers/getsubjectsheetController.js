const Semester = require('../models/semesterModel');
const mongoose = require('mongoose');

exports.getStudentsForSemester = async (req, res) => {
  try {
    const { semesterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester ID format'
      });
    }

    const semester = await Semester.findById(semesterId);
    
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found'
      });
    }

    // Get students from the last semester content (highest semester number)
    let students = [];
    
    if (semester.semesterContents && semester.semesterContents.length > 0) {
      // Find the last semester content (highest semester number)
      const lastSemesterContent = semester.semesterContents.reduce((latest, current) => {
        return current.semesterNumber > latest.semesterNumber ? current : latest;
      });
      
      students = lastSemesterContent.students.map(student => ({
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email
      }));
    } else {
      // Fallback for old structure - return empty array since old structure is deprecated
      students = [];
    }

    return res.status(200).json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Error fetching students for semester:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching students',
      error: error.message
    });
  }
};