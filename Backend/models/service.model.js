// models/serviceOffer.model.js
const mongoose = require('mongoose');

const serviceOfferSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['electronics', 'furniture', 'clothing', 'appliances', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  startingPrice: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  experience: {
    type: String
  },
  specialties: {
    type: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Static methods
serviceOfferSchema.statics.createOffer = async function(data) {
  return await this.create(data);
};

const ServiceOffer = mongoose.model('ServiceOffer', serviceOfferSchema);

module.exports = ServiceOffer;