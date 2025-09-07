const express = require('express');
const router = express.Router();
const { getStudentMarks } = require('../controllers/getstudentmarksController');

// GET /api/student-marks/:subjectId/:semesterId
router.get('/:subjectId/:semesterId', getStudentMarks);

module.exports = router;
