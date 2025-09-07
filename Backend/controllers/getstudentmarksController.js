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

    console.log('=== STUDENT MARKS REQUEST ===');
    console.log('Subject ID:', subjectId);
    console.log('Semester ID:', semesterId);
    console.log('Student ID:', studentId);

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(subjectId) || 
        !mongoose.Types.ObjectId.isValid(semesterId) || 
        !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // ✅ FIXED: Find subject sheet and filter by specific student
    const subjectSheet = await SubjectSheet.findOne({
      semesterId: new mongoose.Types.ObjectId(semesterId),
      courseId: new mongoose.Types.ObjectId(subjectId)
    })
    .select('students cloDetails totalMarks')
    .lean();

    if (!subjectSheet || !subjectSheet.students || subjectSheet.students.length === 0) {
      console.log('No subject sheet found, returning dummy data');
      // Return dummy student data
      const dummyStudent = {
        id: 'dummy-student',
        name: 'Zabitdummy1',
        rollNumber: 'FC-001',
        email: 'zabitdummy1@example.com'
      };

      return res.status(200).json({
        student: dummyStudent,
        studentMarks: {
          clo1: { assignment: '85', quiz: '42', mid: '45', final: '92', kpi: '88%' },
          clo2: { assignment: '78', quiz: '38', mid: '42', final: '85', kpi: '76%' },
          clo3: { assignment: '92', quiz: '48', mid: '47', final: '88', kpi: '84%' }
        },
        cloDetails: {},
        totalMarks: {},
        isDummy: true,
        loadTime: Date.now() - startTime
      });
    }

    // ✅ FIXED: Find specific student by matching `studentId` in SubjectSheets collection
    const targetStudent = subjectSheet.students.find(student => 
      student.studentId && student.studentId.toString() === studentId.toString()
    );

    console.log('Target student found:', !!targetStudent);
    console.log('All students in sheet:', subjectSheet.students.map(s => ({
      studentId: s.studentId,
      studentName: s.studentName
    })));

    if (!targetStudent) {
      console.log('Student not found in subject sheet');
      return res.status(404).json({
        message: "Student not found in this subject sheet",
        studentId: studentId,
        availableStudents: subjectSheet.students.map(s => ({
          studentId: s.studentId,
          studentName: s.studentName
        }))
      });
    }

    // ✅ FIXED: Return only the specific student's data
    const studentData = {
      id: targetStudent.studentId,
      name: targetStudent.studentName,
      rollNumber: targetStudent.rollNumber,
      email: targetStudent.email
    };

    // Process marks for this specific student only
    const studentMarks = {};
    if (targetStudent.marks && typeof targetStudent.marks === 'object') {
      Object.entries(targetStudent.marks).forEach(([cloKey, cloData]) => {
        if (cloData && cloData.fields) {
          studentMarks[cloKey] = {
            ...cloData.fields,
            kpi: cloData.kpi || ''
          };
        }
      });
    }

    // Process total marks
    const totalMarks = {};
    if (subjectSheet.cloDetails) {
      Object.entries(subjectSheet.cloDetails).forEach(([cloKey, cloData]) => {
        if (cloData && cloData.totalMarks) {
          totalMarks[cloKey] = cloData.totalMarks;
        }
      });
    }

    const endTime = Date.now();
    console.log(`⚡ Backend processing time: ${endTime - startTime}ms`);

    return res.status(200).json({
      student: studentData, // ✅ Single student object
      studentMarks, // ✅ Only this student's marks
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
