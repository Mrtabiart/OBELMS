const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');


router.get('/', studentController.getAllStudents);


router.post('/', studentController.addStudent);


router.delete('/:id', studentController.deleteStudent);


router.post('/bulk', studentController.bulkAddStudents);

module.exports = router;