const express = require('express');
const router = express.Router();
const { getCLOtoPLOMapping } = require('../controllers/gettingcloploController');

// CLO-PLO mapping route
router.get('/clo-plo-mapping/:courseId', getCLOtoPLOMapping);

module.exports = router;