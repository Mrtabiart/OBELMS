const SubjectSheet = require('../models/finalmarksallsubjectsModel');
const mongoose = require('mongoose');

// ✅ OPTIMIZED: Get only basic sheet info (fastest)
exports.getSubjectSheetsBasic = async (req, res) => {
  try {
    const { semesterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester ID format'
      });
    }

    // Only get essential fields for quick loading
    const subjectSheets = await SubjectSheet.find({ semesterId })
      .select('_id courseId teacherId createdAt updatedAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      subjectSheets
    });
  } catch (error) {
    console.error('Error fetching basic subject sheets:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching subject sheets',
      error: error.message
    });
  }
};

// ✅ OPTIMIZED: Get sheet structure only (CLO details, fields)
exports.getSheetStructure = async (req, res) => {
  try {
    const { sheetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    const sheet = await SubjectSheet.findById(sheetId)
      .select('cloToPloMapping cloDetails');

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Subject sheet not found'
      });
    }

    return res.status(200).json({
      success: true,
      cloToPloMapping: sheet.cloToPloMapping,
      cloDetails: sheet.cloDetails
    });
  } catch (error) {
    console.error('Error fetching sheet structure:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching sheet structure',
      error: error.message
    });
  }
};

// ✅ OPTIMIZED: Get students data only
exports.getSheetStudents = async (req, res) => {
  try {
    const { sheetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    const sheet = await SubjectSheet.findById(sheetId)
      .select('students');

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Subject sheet not found'
      });
    }

    return res.status(200).json({
      success: true,
      students: sheet.students
    });
  } catch (error) {
    console.error('Error fetching sheet students:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching students',
      error: error.message
    });
  }
};

// ✅ OPTIMIZED: Get total marks only
exports.getSheetTotalMarks = async (req, res) => {
  try {
    const { sheetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    const sheet = await SubjectSheet.findById(sheetId)
      .select('cloDetails');

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Subject sheet not found'
      });
    }

    // Extract total marks from cloDetails
    const totalMarks = {};
    Object.keys(sheet.cloDetails).forEach(cloKey => {
      if (sheet.cloDetails[cloKey].totalMarks) {
        totalMarks[cloKey] = sheet.cloDetails[cloKey].totalMarks;
      }
    });

    return res.status(200).json({
      success: true,
      totalMarks
    });
  } catch (error) {
    console.error('Error fetching total marks:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching total marks',
      error: error.message
    });
  }
};

// ✅ OPTIMIZED: Update only marks (fastest update)
exports.updateMarksOnly = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { studentsMarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    // Update only the marks field
    await SubjectSheet.findByIdAndUpdate(
      sheetId,
      { 
        $set: { 
          'students.$[].marks': studentsMarks,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Marks updated successfully'
    });
  } catch (error) {
    console.error('Error updating marks:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating marks',
      error: error.message
    });
  }
};

// ✅ OPTIMIZED: Update only structure (CLO fields)
exports.updateStructureOnly = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { cloFields, totalMarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    // Update only structure fields
    const updateData = {
      updatedAt: new Date()
    };

    if (cloFields) {
      updateData['cloDetails.$[].fields'] = cloFields;
    }

    if (totalMarks) {
      updateData['cloDetails.$[].totalMarks'] = totalMarks;
    }

    await SubjectSheet.findByIdAndUpdate(sheetId, updateData, { new: true });

    return res.status(200).json({
      success: true,
      message: 'Structure updated successfully'
    });
  } catch (error) {
    console.error('Error updating structure:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating structure',
      error: error.message
    });
  }
};

// ✅ OPTIMIZED: Check if sheet exists (lightning fast)
exports.checkSheetExists = async (req, res) => {
  try {
    const { semesterId, courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(semesterId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IDs format'
      });
    }

    // Get teacherId from session
    let teacherId;
    if (req.session && req.session.user && req.session.user.id) {
      teacherId = req.session.user.id;
    } else {
      const token = req.cookies.token;
      if (token) {
        const jwt = require('jsonwebtoken');
        const jwtSecret = process.env.JWT_SECRET || "your-temporary-secret-key";
        const decoded = jwt.verify(token, jwtSecret);
        teacherId = decoded.id;
      }
    }

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Teacher authentication required'
      });
    }

    const existingSheet = await SubjectSheet.findOne({ 
      semesterId, 
      courseId, 
      teacherId 
    }).select('_id');

    return res.status(200).json({
      success: true,
      exists: !!existingSheet,
      sheetId: existingSheet?._id
    });
  } catch (error) {
    console.error('Error checking sheet existence:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking sheet',
      error: error.message
    });
  }
};

// ✅ OPTIMIZED: Create sheet with minimal data
exports.createSheetMinimal = async (req, res) => {
  try {
    const { semesterId, courseId, cloToPloMapping, cloDetails } = req.body;

    // Get teacherId from session
    let teacherId;
    if (req.session && req.session.user && req.session.user.id) {
      teacherId = req.session.user.id;
    } else {
      const token = req.cookies.token;
      if (token) {
        const jwt = require('jsonwebtoken');
        const jwtSecret = process.env.JWT_SECRET || "your-temporary-secret-key";
        const decoded = jwt.verify(token, jwtSecret);
        teacherId = decoded.id;
      }
    }

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Teacher authentication required'
      });
    }

    const subjectSheet = new SubjectSheet({
      semesterId,
      courseId,
      teacherId,
      cloToPloMapping: cloToPloMapping || {},
      cloDetails: cloDetails || {},
      students: []
    });

    await subjectSheet.save();

    return res.status(201).json({
      success: true,
      message: 'Subject sheet created successfully',
      sheetId: subjectSheet._id
    });
  } catch (error) {
    console.error('Error creating minimal sheet:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating sheet',
      error: error.message
    });
  }
};

// ✅ OPTIMIZED: Bulk update students
exports.bulkUpdateStudents = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { students } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    await SubjectSheet.findByIdAndUpdate(
      sheetId,
      { 
        $set: { 
          students: students,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Students updated successfully'
    });
  } catch (error) {
    console.error('Error bulk updating students:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating students',
      error: error.message
    });
  }
};

// ✅ ULTRA FAST: Get all data in one optimized call
exports.getAllDataOptimized = async (req, res) => {
  try {
    const { semesterId, courseId } = req.params;
    
    // Get teacherId
    let teacherId = req.session?.user?.id || 
      (req.cookies.token ? jwt.verify(req.cookies.token, process.env.JWT_SECRET).id : null);
    
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Auth required' });
    }

    // ✅ SINGLE OPTIMIZED QUERY
    const sheet = await SubjectSheet.findOne({ 
      semesterId, 
      courseId, 
      teacherId 
    }).lean(); // lean() for 3x faster queries

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    // ✅ PRE-PROCESS DATA ON SERVER
    const processedData = {
      sheetId: sheet._id,
      cloToPloMapping: sheet.cloToPloMapping,
      cloDetails: sheet.cloDetails,
      students: sheet.students.map(student => ({
        id: student.studentId,
        name: student.studentName,
        rollNumber: student.rollNumber,
        email: student.email,
        marks: student.marks
      })),
      totalMarks: Object.keys(sheet.cloDetails).reduce((acc, cloKey) => {
        acc[cloKey] = sheet.cloDetails[cloKey].totalMarks || {};
        return acc;
      }, {}),
      cloFields: Object.keys(sheet.cloDetails).reduce((acc, cloKey) => {
        acc[cloKey] = sheet.cloDetails[cloKey].fields || [];
        return acc;
      }, {})
    };

    return res.status(200).json({
      success: true,
      data: processedData
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ LEGACY: Keep original methods for compatibility
exports.getSubjectSheets = async (req, res) => {
  try {
    const { semesterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester ID format'
      });
    }

    const subjectSheets = await SubjectSheet.find({ semesterId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      subjectSheets: subjectSheets || []
    });
  } catch (error) {
    console.error('Error fetching subject sheets:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching subject sheets',
      error: error.message
    });
  }
};

// Get specific subject sheet
exports.getSubjectSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    const subjectSheet = await SubjectSheet.findById(sheetId);

    if (!subjectSheet) {
      return res.status(404).json({
        success: false,
        message: 'Subject sheet not found'
      });
    }

    return res.status(200).json({
      success: true,
      subjectSheet
    });
  } catch (error) {
    console.error('Error fetching subject sheet:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching subject sheet',
      error: error.message
    });
  }
};

// Create new subject sheet
exports.createSubjectSheet = async (req, res) => {
  try {
    const { semesterId, courseId, cloToPloMapping, cloDetails, students } = req.body;

    console.log('=== CREATE SUBJECT SHEET DEBUG ===');
    console.log('Request body:', { semesterId, courseId, students: students?.length });

    // ✅ Get teacherId from session
    let teacherId;
    
    if (req.session && req.session.user && req.session.user.id) {
      teacherId = req.session.user.id;
      console.log('Teacher ID from session:', teacherId);
    } else {
      // Try to get from JWT token
      const token = req.cookies.token;
      if (token) {
        const jwt = require('jsonwebtoken');
        const jwtSecret = process.env.JWT_SECRET || "your-temporary-secret-key";
        const decoded = jwt.verify(token, jwtSecret);
        teacherId = decoded.id;
        console.log('Teacher ID from JWT:', teacherId);
      }
    }

    if (!teacherId) {
      console.log('No teacher ID found');
      return res.status(401).json({
        success: false,
        message: 'Teacher authentication required'
      });
    }

    // Validate required fields
    if (!semesterId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'semesterId and courseId are required'
      });
    }

    // Check if sheet already exists for this course and semester
    const existingSheet = await SubjectSheet.findOne({ 
      semesterId, 
      courseId, 
      teacherId 
    });

    if (existingSheet) {
      return res.status(409).json({
        success: false,
        message: 'Subject sheet already exists for this course and semester'
      });
    }

    const subjectSheet = new SubjectSheet({
      semesterId,
      courseId,
      teacherId,
      cloToPloMapping: cloToPloMapping || {},
      cloDetails: cloDetails || {},
      students: students || []
    });

    console.log('Saving subject sheet...');
    await subjectSheet.save();
    console.log('Subject sheet saved successfully:', subjectSheet._id);

    return res.status(201).json({
      success: true,
      message: 'Subject sheet created successfully',
      subjectSheet
    });
  } catch (error) {
    console.error('=== ERROR IN createSubjectSheet ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating subject sheet',
      error: error.message
    });
  }
};

// Update subject sheet
exports.updateSubjectSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    updateData.updatedAt = new Date();

    const subjectSheet = await SubjectSheet.findByIdAndUpdate(
      sheetId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!subjectSheet) {
      return res.status(404).json({
        success: false,
        message: 'Subject sheet not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subject sheet updated successfully',
      subjectSheet
    });
  } catch (error) {
    console.error('Error updating subject sheet:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating subject sheet',
      error: error.message
    });
  }
};

// Update student marks
exports.updateStudentMarks = async (req, res) => {
  try {
    const { sheetId, studentId } = req.params;
    const { marks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sheetId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID or student ID format'
      });
    }

    const subjectSheet = await SubjectSheet.findById(sheetId);
    if (!subjectSheet) {
      return res.status(404).json({
        success: false,
        message: 'Subject sheet not found'
      });
    }

    // Find and update student marks
    const studentIndex = subjectSheet.students.findIndex(
      student => student.studentId.toString() === studentId
    );

    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in this subject sheet'
      });
    }

    // Update marks
    subjectSheet.students[studentIndex].marks = marks;
    subjectSheet.updatedAt = new Date();

    await subjectSheet.save();

    return res.status(200).json({
      success: true,
      message: 'Student marks updated successfully',
      student: subjectSheet.students[studentIndex]
    });
  } catch (error) {
    console.error('Error updating student marks:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating student marks',
      error: error.message
    });
  }
};

// Add students to subject sheet
exports.addStudentsToSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { students } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    const subjectSheet = await SubjectSheet.findById(sheetId);
    if (!subjectSheet) {
      return res.status(404).json({
        success: false,
        message: 'Subject sheet not found'
      });
    }

    // Add new students (avoid duplicates)
    const existingStudentIds = subjectSheet.students.map(s => s.studentId.toString());
    
    const newStudents = students.filter(student => 
      !existingStudentIds.includes(student.studentId.toString())
    );

    if (newStudents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All students already exist in this sheet'
      });
    }

    subjectSheet.students.push(...newStudents);
    subjectSheet.updatedAt = new Date();

    await subjectSheet.save();

    return res.status(200).json({
      success: true,
      message: `${newStudents.length} students added successfully`,
      addedStudents: newStudents
    });
  } catch (error) {
    console.error('Error adding students to sheet:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding students',
      error: error.message
    });
  }
};

// Delete subject sheet
exports.deleteSubjectSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    const subjectSheet = await SubjectSheet.findByIdAndDelete(sheetId);

    if (!subjectSheet) {
      return res.status(404).json({
        success: false,
        message: 'Subject sheet not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subject sheet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject sheet:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting subject sheet',
      error: error.message
    });
  }
};

// Get students with complete data for a subject sheet
exports.getStudentsForSubjectSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet ID format'
      });
    }

    const subjectSheet = await SubjectSheet.findById(sheetId)
      .select('students cloToPloMapping cloDetails');

    if (!subjectSheet) {
      return res.status(404).json({
        success: false,
        message: 'Subject sheet not found'
      });
    }

    return res.status(200).json({
      success: true,
      students: subjectSheet.students,
      cloToPloMapping: subjectSheet.cloToPloMapping,
      cloDetails: subjectSheet.cloDetails
    });
  } catch (error) {
    console.error('Error fetching students for subject sheet:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching students',
      error: error.message
    });
  }
};

// ✅ NEW: Get complete PLO data for a student across all subjects
exports.getStudentCompletePLO = async (req, res) => {
  try {
    console.log('=== getStudentCompletePLO called ===');
    const { semesterId, studentName } = req.params;
    console.log('Params:', { semesterId, studentName });

    // Get all subject sheets for this semester
    const sheets = await SubjectSheet.find({ semesterId })
      .select('students cloToPloMapping cloDetails courseId')
      .populate('courseId', 'name')
      .lean();

    console.log('Found sheets:', sheets.length);

    const ploData = {};
    
    // Initialize all 12 PLOs
    for (let i = 1; i <= 12; i++) {
      ploData[`PLO ${i}`] = {
        totalKPI: 0,
        validCLOs: 0,
        percentage: 0,
        subjects: []
      };
    }

    // Process each subject sheet
    sheets.forEach(sheet => {
      const student = sheet.students.find(s => s.studentName === studentName);
      if (!student) return;

      console.log('Processing student:', student.studentName);

      // Process each CLO in this subject
      Object.keys(sheet.cloToPloMapping).forEach(cloKey => {
        const plo = sheet.cloToPloMapping[cloKey];
        if (ploData[plo] && student.marks[cloKey]) {
          const kpiValue = student.marks[cloKey].kpi;
          if (kpiValue && kpiValue !== '') {
            const numericValue = parseFloat(kpiValue.replace('%', ''));
            if (!isNaN(numericValue)) {
              ploData[plo].totalKPI += numericValue;
              ploData[plo].validCLOs++;
              ploData[plo].subjects.push({
                subjectName: sheet.courseId.name,
                cloKey: cloKey,
                kpi: numericValue
              });
            }
          }
        }
      });
    });

    // Calculate percentages
    Object.keys(ploData).forEach(plo => {
      if (ploData[plo].validCLOs > 0) {
        ploData[plo].percentage = Math.round(ploData[plo].totalKPI / ploData[plo].validCLOs);
      }
    });

    console.log('Final PLO data:', ploData);

    return res.status(200).json({
      success: true,
      studentName,
      ploData
    });
  } catch (error) {
    console.error('Error in getStudentCompletePLO:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while calculating PLO',
      error: error.message
    });
  }
};

// ✅ NEW: Get all students' complete PLO data for a semester
exports.getAllStudentsCompletePLO = async (req, res) => {
  try {
    console.log('=== getAllStudentsCompletePLO called ===');
    const { semesterId } = req.params;
    console.log('Semester ID:', semesterId);

    // Get all subject sheets for this semester
    const sheets = await SubjectSheet.find({ semesterId })
      .select('students cloToPloMapping cloDetails courseId')
      .populate('courseId', 'name')
      .lean();

    console.log('Found sheets:', sheets.length);

    // Get all unique students
    const allStudents = new Set();
    sheets.forEach(sheet => {
      sheet.students.forEach(student => {
        allStudents.add(student.studentName);
      });
    });

    console.log('All students:', Array.from(allStudents));

    const studentsPLOData = {};

    // Process each student
    allStudents.forEach(studentName => {
      const ploData = {};
      
      // Initialize all 12 PLOs
      for (let i = 1; i <= 12; i++) {
        ploData[`PLO ${i}`] = {
          totalKPI: 0,
          validCLOs: 0,
          percentage: 0,
          subjects: []
        };
      }

      // Process each subject sheet for this student
      sheets.forEach(sheet => {
        const student = sheet.students.find(s => s.studentName === studentName);
        if (!student) return;

        // Process each CLO in this subject
        Object.keys(sheet.cloToPloMapping).forEach(cloKey => {
          const plo = sheet.cloToPloMapping[cloKey];
          if (ploData[plo] && student.marks[cloKey]) {
            const kpiValue = student.marks[cloKey].kpi;
            if (kpiValue && kpiValue !== '') {
              const numericValue = parseFloat(kpiValue.replace('%', ''));
              if (!isNaN(numericValue)) {
                ploData[plo].totalKPI += numericValue;
                ploData[plo].validCLOs++;
                ploData[plo].subjects.push({
                  subjectName: sheet.courseId.name,
                  cloKey: cloKey,
                  kpi: numericValue
                });
              }
            }
          }
        });
      });

      // Calculate percentages
      Object.keys(ploData).forEach(plo => {
        if (ploData[plo].validCLOs > 0) {
          ploData[plo].percentage = Math.round(ploData[plo].totalKPI / ploData[plo].validCLOs);
        }
      });

      studentsPLOData[studentName] = ploData;
    });

    console.log('Final students PLO data:', Object.keys(studentsPLOData));

    return res.status(200).json({
      success: true,
      studentsPLOData
    });
  } catch (error) {
    console.error('Error in getAllStudentsCompletePLO:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while calculating all students PLO',
      error: error.message
    });
  }
};

// ✅ NEW: Get specific PLO percentage for a student
exports.getStudentPLOPercentage = async (req, res) => {
  try {
    console.log('=== getStudentPLOPercentage called ===');
    const { semesterId, studentName, ploNumber } = req.params;
    console.log('Params:', { semesterId, studentName, ploNumber });

    // Get all subject sheets for this semester
    const sheets = await SubjectSheet.find({ semesterId })
      .select('students cloToPloMapping cloDetails courseId')
      .populate('courseId', 'name')
      .lean();

    const targetPLO = `PLO ${ploNumber}`;
    let totalKPI = 0;
    let validCLOs = 0;
    const subjects = [];

    // Process each subject sheet
    sheets.forEach(sheet => {
      const student = sheet.students.find(s => s.studentName === studentName);
      if (!student) return;

      // Find CLOs mapped to this PLO
      Object.keys(sheet.cloToPloMapping).forEach(cloKey => {
        const plo = sheet.cloToPloMapping[cloKey];
        if (plo === targetPLO && student.marks[cloKey]) {
          const kpiValue = student.marks[cloKey].kpi;
          if (kpiValue && kpiValue !== '') {
            const numericValue = parseFloat(kpiValue.replace('%', ''));
            if (!isNaN(numericValue)) {
              totalKPI += numericValue;
              validCLOs++;
              subjects.push({
                subjectName: sheet.courseId.name,
                cloKey: cloKey,
                kpi: numericValue
              });
            }
          }
        }
      });
    });

    const percentage = validCLOs > 0 ? Math.round(totalKPI / validCLOs) : 0;

    console.log('PLO calculation result:', { percentage, totalKPI, validCLOs });

    return res.status(200).json({
      success: true,
      studentName,
      ploNumber: targetPLO,
      percentage,
      totalKPI,
      validCLOs,
      subjects
    });
  } catch (error) {
    console.error('Error in getStudentPLOPercentage:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while calculating PLO percentage',
      error: error.message
    });
  }
};
