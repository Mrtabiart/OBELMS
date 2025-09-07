const SubjectSheet = require('../models/finalmarksallsubjectsModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.getStudentMarks = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Authentication check
    if (!req.session || !req.session.user || !req.session.user.id) {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-temporary-secret-key');
        if (decoded.role !== 'student') {
          return res.status(403).json({ message: "Access denied" });
        }

        req.session = req.session || {};
        req.session.user = {
          id: decoded.id,
          role: decoded.role
        };
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    const { subjectId, semesterId } = req.params;
    const studentId = req.session.user.id;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(subjectId) || 
        !mongoose.Types.ObjectId.isValid(semesterId) || 
        !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // 🚀 OPTIMIZED QUERY - Only select needed fields
    const subjectSheet = await SubjectSheet.findOne({
      semesterId: new mongoose.Types.ObjectId(semesterId),
      courseId: new mongoose.Types.ObjectId(subjectId)
    })
    .select('students studentName marks cloDetails totalMarks')
    .lean(); // Use lean() for better performance

    if (!subjectSheet || !subjectSheet.students || subjectSheet.students.length === 0) {
      // If no subject sheet found or no students, return dummy students
      const dummyStudents = [
        "Zabitdummy1",
        "Zabitdummy2", 
        "Zabitdummy3",
        "Zabitdummy4",
        "Zabitdummy5"
      ];

      return res.status(200).json({
        students: dummyStudents,
        studentMarks: {},
        cloDetails: {},
        totalMarks: {},
        isDummy: true,
        loadTime: Date.now() - startTime
      });
    }

    // 🚀 OPTIMIZED DATA PROCESSING
    const students = subjectSheet.students.map(student => student.studentName);
    
    // Create student marks object in the format expected by frontend
    const studentMarks = {};
    const totalMarks = {};

    // Process in parallel using Promise.all
    await Promise.all([
      // Process student marks
      new Promise((resolve) => {
        subjectSheet.students.forEach((student, index) => {
          const studentKey = index + 1;
          studentMarks[studentKey] = {};
          
          if (student.marks && typeof student.marks === 'object') {
            Object.entries(student.marks).forEach(([cloKey, cloData]) => {
              if (cloData && cloData.fields) {
                studentMarks[studentKey][cloKey] = {
                  ...cloData.fields,
                  kpi: cloData.kpi || ''
                };
              }
            });
          }
        });
        resolve();
      }),
      
      // Process total marks
      new Promise((resolve) => {
        if (subjectSheet.cloDetails) {
          Object.entries(subjectSheet.cloDetails).forEach(([cloKey, cloData]) => {
            if (cloData && cloData.totalMarks) {
              totalMarks[cloKey] = cloData.totalMarks;
            }
          });
        }
        resolve();
      })
    ]);

    const endTime = Date.now();
    console.log(`⚡ Backend processing time: ${endTime - startTime}ms`);

    return res.status(200).json({
      students,
      studentMarks,
      cloDetails: subjectSheet.cloDetails || {},
      totalMarks,
      isDummy: false,
      loadTime: endTime - startTime
    });

  } catch (error) {
    console.error("Error fetching student marks:", error);
    res.status(500).json({
      message: "Failed to fetch student marks",
      error: error.message
    });
  }
};
