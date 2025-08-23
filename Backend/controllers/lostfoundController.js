const LostItem = require('../models/lostfoundModel'); // Adjust path as needed
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lostitem-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all lost items
const getAllItems = async (req, res) => {
  try {
    const items = await LostItem.find().sort({ dateAdded: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to fetch items', error: error.message });
  }
};

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Failed to fetch item', error: error.message });
  }
};

// Add new lost item
const addItem = async (req, res) => {
  try {
    const itemData = {
      itemName: req.body.itemName,
      category: req.body.category,
      color: req.body.color,
      location: req.body.location,
      dateFound: req.body.dateFound,
      description: req.body.description,
      image: req.file ? `/uploads/${req.file.filename}` : null
    };

    const newItem = new LostItem(itemData);
    const savedItem = await newItem.save();
    
    res.status(201).json({
      message: 'Item added successfully',
      item: savedItem
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Failed to add item', error: error.message });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const updateData = req.body;
    
    // If there's a new image file, update the image path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      
      // Delete old image if it exists
      const existingItem = await LostItem.findById(req.params.id);
      if (existingItem && existingItem.image) {
        const oldImagePath = path.join(__dirname, '..', existingItem.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedItem = await LostItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Failed to update item', error: error.message });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete associated image file
    if (item.image) {
      const imagePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await LostItem.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
};

// Claim item
const claimItem = async (req, res) => {
  try {
    const { name, contact, details } = req.body;
    const itemId = req.params.id;

    const updatedItem = await LostItem.findByIdAndUpdate(
      itemId,
      {
        isClaimed: true,
        claimedBy: {
          name,
          contact,
          details,
          dateOfClaim: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({
      message: 'Item claimed successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ message: 'Failed to claim item', error: error.message });
  }
};

// Mark item as returned
const markAsReturned = async (req, res) => {
  try {
    const updatedItem = await LostItem.findByIdAndUpdate(
      req.params.id,
      { isReturned: true },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({
      message: 'Item marked as returned successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error marking item as returned:', error);
    res.status(500).json({ message: 'Failed to mark item as returned', error: error.message });
  }
};

// Get filtered items
const getFilteredItems = async (req, res) => {
  try {
    const { filter } = req.query;
    let query = {};

    switch (filter) {
      case 'claimed':
        query = { isClaimed: true };
        break;
      case 'unclaimed':
        query = { isClaimed: false };
        break;
      case 'returned':
        query = { isReturned: true };
        break;
      default:
        query = {};
    }

    const items = await LostItem.find(query).sort({ dateAdded: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching filtered items:', error);
    res.status(500).json({ message: 'Failed to fetch filtered items', error: error.message });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  claimItem,
  markAsReturned,
  getFilteredItems,
  upload
};