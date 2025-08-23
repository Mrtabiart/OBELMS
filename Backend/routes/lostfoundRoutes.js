const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  claimItem,
  markAsReturned,
  getFilteredItems,
  upload
} = require('../controllers/lostfoundController');

// GET /api/lostfound - Get all items or filtered items
router.get('/', (req, res) => {
  if (req.query.filter) {
    getFilteredItems(req, res);
  } else {
    getAllItems(req, res);
  }
});

// GET /api/lostfound/:id - Get single item by ID
router.get('/:id', getItemById);

// POST /api/lostfound - Add new item (with file upload)
router.post('/', upload.single('image'), addItem);

// PUT /api/lostfound/:id - Update item (with optional file upload)
router.put('/:id', upload.single('image'), updateItem);

// DELETE /api/lostfound/:id - Delete item
router.delete('/:id', deleteItem);

// PUT /api/lostfound/:id/claim - Claim an item
router.put('/:id/claim', claimItem);

// PUT /api/lostfound/:id/return - Mark item as returned
router.put('/:id/return', markAsReturned);

module.exports = router;