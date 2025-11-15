const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
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
  budget: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  preferredContactTime: {
    type: String
  },
  image: {
    type: String // URL
  },
  status: {
    type: String,
    enum: ['New', 'Pending', 'In Progress', 'Completed'],
    default: 'New'
  },
  offers: [{
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: String,
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Static methods
maintenanceRequestSchema.statics.createRequest = async function(data) {
  return await this.create(data);
};

maintenanceRequestSchema.statics.addOffer = async function(requestId, offerData) {
  return await this.findByIdAndUpdate(requestId, { $push: { offers: offerData } }, { new: true });
};

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest;