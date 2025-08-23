const mongoose = require('mongoose')

const lostItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  dateFound: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  isClaimed: {
    type: Boolean,
    default: false
  },
  isReturned: {
    type: Boolean,
    default: false
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  claimedBy: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    details: {
      type: String,
      trim: true
    },
    dateOfClaim: {
      type: Date,
      default: Date.now
    }
  }
})

// Create the model from the schema
const LostItem = mongoose.model('LostItem', lostItemSchema)

module.exports = LostItem