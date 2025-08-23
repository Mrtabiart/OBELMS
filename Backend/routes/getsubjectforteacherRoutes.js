const express = require('express');
const router = express.Router();
const getsubjectforteacherController = require('../controllers/getsubjectforteacherController');

router.get('/subjects', getsubjectforteacherController.getSubjectsForTeacher);

module.exports = router;