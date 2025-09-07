const express = require('express');
const router = express.Router();
const getsubjectforstudentController = require('../controllers/getsubjectforstudentController');

router.get('/subjects', getsubjectforstudentController.getSubjectsForStudent);
router.get('/profile', getsubjectforstudentController.getStudentProfile);

module.exports = router;