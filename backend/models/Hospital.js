const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  specialty: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Government', 'Private', 'Unknown'],
    default: 'Unknown'
  },
  pmjay_empaneled: {
    type: Boolean,
    default: false
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
}, {
  timestamps: true
});

// Create text index for search functionality
hospitalSchema.index({
  name: 'text',
  city: 'text',
  district: 'text',
  state: 'text',
  specialty: 'text',
  address: 'text'
});

module.exports = mongoose.model('Hospital', hospitalSchema);