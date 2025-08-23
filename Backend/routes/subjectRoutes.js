const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

router.get('/', subjectController.getAllSubjects);

router.get('/program/:programId', subjectController.getSubjectsByProgram);

router.get('/:id', subjectController.getSubjectById);

router.post('/', subjectController.createSubject);

router.put('/:id', subjectController.updateSubject);

router.delete('/:id', subjectController.deleteSubject);

router.post('/:id/clo', subjectController.addClo);

router.delete('/:subjectId/clo/:cloId', subjectController.removeClo);

module.exports = router;