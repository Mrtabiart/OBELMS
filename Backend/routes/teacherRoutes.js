const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');


router.get('/program/:programId', teacherController.getTeachersByProgram);


router.post('/', teacherController.upload.single('photo'), teacherController.createTeacher);


router.put('/:id', teacherController.upload.single('photo'), teacherController.updateTeacher);


router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;