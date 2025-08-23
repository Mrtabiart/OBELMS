const express = require('express');
const router = express.Router();
const {
  getAllTrash,
  getTrashById,
  restoreTrashItem,
  deleteTrashItem
} = require('../controllers/trashController');

router.get('/', getAllTrash);
router.get('/:id', getTrashById);
router.post('/restore/:id', restoreTrashItem);
router.delete('/:id', deleteTrashItem);

module.exports = router;