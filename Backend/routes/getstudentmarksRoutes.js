const express = require('express');
const router = express.Router();
const { getStudentMarks } = require('../controllers/getstudentmarksController');

// ✅ TEST ENDPOINT
router.get('/test', (req, res) => {
  res.json({ message: 'Student marks route is working!', timestamp: new Date() });
});

// GET /api/student-marks/:subjectId/:semesterId
router.get('/:subjectId/:semesterId', getStudentMarks);

module.exports = router;
