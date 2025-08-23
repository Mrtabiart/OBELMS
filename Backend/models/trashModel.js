const mongoose = require('mongoose');

const trashSchema = new mongoose.Schema({
  originalCollection: {
    type: String,
    required: true,
  },
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  data: {  
    type: Object,
    required: true,
  },
  deletedBy: {
    type: String,
    required: true,
  },
  deletedAt: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Trash', trashSchema);
