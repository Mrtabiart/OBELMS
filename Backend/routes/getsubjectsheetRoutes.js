const express = require('express');
const router = express.Router();
const { getStudentsForSemester } = require('../controllers/getsubjectsheetController');


router.get('/semester/:semesterId/students', getStudentsForSemester);

module.exports = router;