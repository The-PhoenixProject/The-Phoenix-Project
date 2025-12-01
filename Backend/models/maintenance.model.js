// models/maintenance.model.js - Enhanced with all features
const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  // Basic Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Electronics', 'Furniture', 'Clothing', 'Accessories', 'Appliances', 'Other'],
    default: 'Other'
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
    type: String,
    trim: true
  },
  preferredContactTime: {
    type: String
  },
  
  // Media
  image: {
    type: String // URL to main image
  },
  images: [{
    type: String // Array of image URLs
  }],
  
  // Status Management
  status: {
    type: String,
    enum: [
      'New',              // Just created, no offers yet
      'Pending',          // Has offers, awaiting selection
      'Matched',          // Provider selected, payment held
      'In Progress',      // Work has started
      'Awaiting Confirmation', // Provider marked complete, awaiting requester confirmation
      'Completed',        // Work confirmed and paid
      'Cancelled',        // Cancelled by requester
      'Disputed'          // Under dispute review
    ],
    default: 'New',
    index: true
  },
  
  // Status History (for tracking)
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Service Offers
  offers: [{
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    price: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Selected Provider & Work Details
  selectedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  agreedPrice: {
    type: String
  },
  workStartedAt: {
    type: Date
  },
  workCompletedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  
  // Before/After Photos (for completed work)
  beforePhotos: [{
    type: String
  }],
  afterPhotos: [{
    type: String
  }],
  
  // Dispute Management
  dispute: {
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    status: {
      type: String,
      enum: ['open', 'resolved', 'cancelled']
    },
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    openedAt: Date,
    resolvedAt: Date
  },
  
  // Reviews (mutual rating after completion)
  requesterReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  providerReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  
  // Payment Tracking
  payment: {
    status: {
      type: String,
      enum: ['pending', 'held', 'released', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    escrowId: String,
    heldAt: Date,
    releasedAt: Date,
    refundedAt: Date
  },
  
  // Scheduling
  scheduledDate: Date,
  estimatedDuration: String, // e.g. "2-3 hours"
  
  // Visibility & Urgency
  isUrgent: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // View Count (for analytics)
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
maintenanceRequestSchema.index({ user: 1, status: 1 });
maintenanceRequestSchema.index({ selectedProvider: 1, status: 1 });
maintenanceRequestSchema.index({ category: 1, status: 1 });
maintenanceRequestSchema.index({ createdAt: -1 });

// Virtual for offer count
maintenanceRequestSchema.virtual('offerCount').get(function() {
  return this.offers ? this.offers.length : 0;
});

// Virtual for pending offers count
maintenanceRequestSchema.virtual('pendingOffersCount').get(function() {
  return this.offers ? this.offers.filter(o => o.status === 'pending').length : 0;
});

// Static method: Create request
maintenanceRequestSchema.statics.createRequest = async function(data) {
  const request = await this.create(data);
  return request;
};

// Static method: Add offer to request
maintenanceRequestSchema.statics.addOffer = async function(requestId, offerData) {
  const request = await this.findByIdAndUpdate(
    requestId,
    { 
      $push: { offers: offerData },
      $set: { status: 'Pending' }
    },
    { new: true }
  );
  return request;
};

// Instance method: Accept offer
maintenanceRequestSchema.methods.acceptOffer = async function(offerId) {
  const offer = this.offers.id(offerId);
  if (!offer) throw new Error('Offer not found');
  
  // Update offer statuses
  this.offers.forEach(o => {
    if (o._id.toString() === offerId) {
      o.status = 'accepted';
    } else if (o.status === 'pending') {
      o.status = 'rejected';
    }
  });
  
  // Update request
  this.status = 'Matched';
  this.selectedProvider = offer.provider;
  this.agreedPrice = offer.price;
  
  await this.save();
  return this;
};

// Instance method: Start work
maintenanceRequestSchema.methods.startWork = async function() {
  this.status = 'In Progress';
  this.workStartedAt = new Date();
  await this.save();
  return this;
};

// Instance method: Mark work complete
maintenanceRequestSchema.methods.markComplete = async function() {
  this.status = 'Awaiting Confirmation';
  this.workCompletedAt = new Date();
  await this.save();
  return this;
};

// Instance method: Confirm completion
maintenanceRequestSchema.methods.confirmCompletion = async function() {
  this.status = 'Completed';
  this.completedAt = new Date();
  this.payment.status = 'released';
  this.payment.releasedAt = new Date();
  await this.save();
  return this;
};

// Instance method: Open dispute
maintenanceRequestSchema.methods.openDispute = async function(userId, reason) {
  this.dispute = {
    openedBy: userId,
    reason,
    status: 'open',
    openedAt: new Date()
  };
  this.status = 'Disputed';
  await this.save();
  return this;
};

// Middleware: Auto-confirm after 7 days if requester doesn't respond
maintenanceRequestSchema.pre('save', function(next) {
  if (this.status === 'Awaiting Confirmation' && this.workCompletedAt) {
    const daysSinceComplete = (Date.now() - this.workCompletedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceComplete >= 7 && !this.completedAt) {
      console.log('Auto-confirming request after 7 days:', this._id);
      this.status = 'Completed';
      this.completedAt = new Date();
      this.payment.status = 'released';
      this.payment.releasedAt = new Date();
    }
  }
  next();
});

// Ensure virtuals are included in JSON
maintenanceRequestSchema.set('toJSON', { virtuals: true });
maintenanceRequestSchema.set('toObject', { virtuals: true });

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest;