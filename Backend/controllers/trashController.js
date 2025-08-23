const mongoose = require('mongoose');
const Trash = require('../models/trashModel');

const getAllTrash = async (req, res) => {
    try {
      const items = await Trash.find({}) 
        .sort({ deletedAt: -1 })
        .limit(100);
      res.json(items);
    } catch (err) {
    console.error('Error fetching trash items:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getTrashById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const item = await Trash.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in trash' });
    }

    res.json(item);
  } catch (err) {
    console.error('Error fetching trash item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const restoreTrashItem = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
  
      const trashItem = await Trash.findById(id);
  
      if (!trashItem) {
        return res.status(404).json({ message: 'Item not found in trash' });
      }
  
      let Model;
      try {
        const modelName = trashItem.originalCollection.endsWith('s')
          ? trashItem.originalCollection.slice(0, -1)
          : trashItem.originalCollection;
  
        const formattedModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);  
  
      
        if (mongoose.models[formattedModelName]) {
          Model = mongoose.models[formattedModelName];
        } else {
        
          Model = require(`../models/${formattedModelName}Model`);
        }
      } catch (error) {
        console.error('Error loading model:', error);
        return res.status(500).json({
          message: `Could not load model for collection: ${trashItem.originalCollection}`,
          error: error.message
        });
      }
  
     
      const dataToRestore = {
        ...trashItem.data,  
        _id: trashItem.originalId  
      };
  
      try {
        const existingItem = await Model.findById(dataToRestore._id);
        if (existingItem) {
          await Model.findByIdAndUpdate(dataToRestore._id, dataToRestore);
        } else {
          await Model.create(dataToRestore);
        }
      } catch (error) {
        if (error.code === 11000) {
          
          delete dataToRestore._id;
          await Model.create(dataToRestore);
        } else {
          throw error;
        }
      }
  
      
      await Trash.findByIdAndDelete(id);
  
      res.json({
        message: 'Item restored successfully',
        originalCollection: trashItem.originalCollection,
        originalId: trashItem.originalId
      });
    } catch (err) {
      console.error('Error restoring item:', err);
      res.status(500).json({ message: 'Error restoring item', error: err.message });
    }
  };
  
const deleteTrashItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const result = await Trash.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Item not found in trash' });
    }

    res.json({ message: 'Item permanently deleted' });
  } catch (err) {
    console.error('Error deleting trash item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllTrash,
  getTrashById,
  restoreTrashItem,
  deleteTrashItem
};