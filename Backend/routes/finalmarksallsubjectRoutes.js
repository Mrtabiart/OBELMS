const express = require('express');
const router = express.Router();
const {
  // ✅ NEW OPTIMIZED ROUTES
  getSubjectSheetsBasic,
  getSheetStructure,
  getSheetStudents,
  getSheetTotalMarks,
  updateMarksOnly,
  updateStructureOnly,
  checkSheetExists,
  createSheetMinimal,
  bulkUpdateStudents,
  
  // ✅ NEW PLO ROUTES
  getStudentCompletePLO,
  getAllStudentsCompletePLO,
  getStudentPLOPercentage,
  
  // ✅ LEGACY ROUTES
  getSubjectSheets,
  getSubjectSheet,
  createSubjectSheet,
  updateSubjectSheet,
  updateStudentMarks,
  addStudentsToSheet,
  deleteSubjectSheet,
  getStudentsForSubjectSheet
} = require('../controllers/finalmarksallsubjectsController');

// ✅ NEW PLO ROUTES
router.get('/student-plo/:semesterId/:studentName', getStudentCompletePLO);
router.get('/all-students-plo/:semesterId', getAllStudentsCompletePLO);
router.get('/student-plo/:semesterId/:studentName/:ploNumber', getStudentPLOPercentage);

// ✅ OPTIMIZED ROUTES (FAST)
router.get('/basic/semester/:semesterId', getSubjectSheetsBasic);
router.get('/structure/:sheetId', getSheetStructure);
router.get('/students/:sheetId', getSheetStudents);
router.get('/total-marks/:sheetId', getSheetTotalMarks);
router.get('/exists/:semesterId/:courseId', checkSheetExists);

router.put('/marks/:sheetId', updateMarksOnly);
router.put('/structure/:sheetId', updateStructureOnly);
router.put('/students/:sheetId', bulkUpdateStudents);

router.post('/minimal', createSheetMinimal);

// ✅ LEGACY ROUTES (COMPATIBILITY)
router.get('/semester/:semesterId', getSubjectSheets);
router.get('/:sheetId', getSubjectSheet);
router.get('/:sheetId/students', getStudentsForSubjectSheet);

router.post('/', createSubjectSheet);
router.put('/:sheetId', updateSubjectSheet);
router.put('/:sheetId/student/:studentId', updateStudentMarks);
router.post('/:sheetId/students', addStudentsToSheet);
router.delete('/:sheetId', deleteSubjectSheet);

module.exports = router;
