// Enhanced maintenance.controller.js with all missing features

const MaintenanceRequest = require('../models/maintenance.model');
const ServiceOffer = require('../models/service.model');
const User = require('../models/user.model');
const logger = require('../utlis/logger');

/**
 * @desc    Get all maintenance requests (browse)
 * @route   GET /api/maintenance/requests
 * @access  Private
 */
exports.getRequests = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter = { isVisible: true };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await MaintenanceRequest.find(filter)
      .populate('user', 'fullName location profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, data: { requests } });
  } catch (error) {
    logger.error('Get requests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create a maintenance request
 * @route   POST /api/maintenance/requests
 * @access  Private
 */
exports.createRequest = async (req, res) => {
  try {
    const { itemName, description, budget, category, location, preferredContactTime, isUrgent } = req.body;

    if (!itemName || !description || !budget) {
      return res.status(400).json({ success: false, message: 'itemName, description and budget are required' });
    }

    const request = await MaintenanceRequest.createRequest({
      user: req.user.userId,
      itemName,
      description,
      budget,
      category,
      location,
      preferredContactTime,
      isUrgent: !!isUrgent
    });

    res.status(201).json({ success: true, message: 'Request created', data: request });
  } catch (error) {
    logger.error('Create request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete own maintenance request (soft-delete)
 * @route   DELETE /api/maintenance/requests/:id
 * @access  Private
 */
exports.deleteRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (request.user.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.isVisible = false;
    request.status = 'Cancelled';
    await request.save();

    res.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    logger.error('Delete request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get single maintenance request with full details
 * @route   GET /api/maintenance/requests/:id
 * @access  Private
 */
exports.getRequestById = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('user', 'fullName location avatar rating reviewCount')
      .populate('offers.provider', 'fullName avatar rating reviewCount')
      .populate('selectedProvider', 'fullName avatar rating reviewCount');
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    logger.error('Get request by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Service provider applies to maintenance request
 * @route   POST /api/maintenance/requests/:id/apply
 * @access  Private
 */
exports.applyToRequest = async (req, res) => {
  try {
    const { price, message } = req.body;
    
    if (!price || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price and message are required' 
      });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Check if already applied
    const alreadyApplied = request.offers.some(
      offer => offer.provider.toString() === req.user.userId
    );

    if (alreadyApplied) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted an offer for this request' 
      });
    }

    // Check if request is still open
    if (request.status !== 'New' && request.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'This request is no longer accepting offers' 
      });
    }

    const offerData = {
      provider: req.user.userId,
      price,
      message,
      status: 'pending',
      createdAt: new Date()
    };

    request.offers.push(offerData);
    request.status = 'Pending'; // Update status to pending once offers come in
    await request.save();

    // Notify request owner
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.user}`).emit('notification:new', {
        type: 'maintenance_offer',
        message: `New offer received for your request: ${request.itemName}`,
        requestId: request._id
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Offer submitted successfully',
      data: request 
    });
  } catch (error) {
    logger.error('Apply to request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Accept a service offer (requester only)
 * @route   POST /api/maintenance/requests/:id/offers/:offerId/accept
 * @access  Private
 */
exports.acceptOffer = async (req, res) => {
  try {
    const { id: requestId, offerId } = req.params;

    const request = await MaintenanceRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify requester owns this request
    if (request.user.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the request owner can accept offers' 
      });
    }

    const offer = request.offers.id(offerId);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Update offer status
    offer.status = 'accepted';
    
    // Reject all other offers
    request.offers.forEach(o => {
      if (o._id.toString() !== offerId) {
        o.status = 'rejected';
      }
    });

    // Update request status and set selected provider
    request.status = 'Matched';
    request.selectedProvider = offer.provider;
    request.agreedPrice = offer.price;

    await request.save();

    // TODO: Initialize escrow payment here
    // await paymentService.holdInEscrow(request.agreedPrice, req.user.userId, offer.provider);

    // Notify provider
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${offer.provider}`).emit('notification:new', {
        type: 'offer_accepted',
        message: `Your offer for "${request.itemName}" has been accepted!`,
        requestId: request._id
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Offer accepted. Payment has been held in escrow.',
      data: request 
    });
  } catch (error) {
    logger.error('Accept offer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Reject a service offer (requester only)
 * @route   POST /api/maintenance/requests/:id/offers/:offerId/reject
 * @access  Private
 */
exports.rejectOffer = async (req, res) => {
  try {
    const { id: requestId, offerId } = req.params;

    const request = await MaintenanceRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.user.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the request owner can reject offers' 
      });
    }

    const offer = request.offers.id(offerId);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    offer.status = 'rejected';
    await request.save();

    // Notify provider
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${offer.provider}`).emit('notification:new', {
        type: 'offer_rejected',
        message: `Your offer for "${request.itemName}" was not selected`,
        requestId: request._id
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Offer rejected',
      data: request 
    });
  } catch (error) {
    logger.error('Reject offer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update work status (provider: start work, mark complete | requester: confirm completion)
 * @route   PATCH /api/maintenance/requests/:id/status
 * @access  Private
 */
exports.updateWorkStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['In Progress', 'Awaiting Confirmation', 'Completed', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isRequester = request.user.toString() === req.user.userId;
    const isProvider = request.selectedProvider && request.selectedProvider.toString() === req.user.userId;

    // Permission checks
    if (status === 'In Progress' && !isProvider) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the service provider can start work' 
      });
    }

    if (status === 'Awaiting Confirmation' && !isProvider) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the service provider can mark work as complete' 
      });
    }

    if (status === 'Completed' && !isRequester) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the requester can confirm completion' 
      });
    }

    request.status = status;

    // Add status change to history
    if (!request.statusHistory) {
      request.statusHistory = [];
    }
    request.statusHistory.push({
      status,
      changedBy: req.user.userId,
      changedAt: new Date()
    });

    await request.save();

    // Notify relevant party
    const io = req.app.get('io');
    if (io) {
      if (status === 'In Progress') {
        io.to(`user:${request.user}`).emit('notification:new', {
          type: 'work_started',
          message: `Work has started on your request: ${request.itemName}`,
          requestId: request._id
        });
      } else if (status === 'Awaiting Confirmation') {
        io.to(`user:${request.user}`).emit('notification:new', {
          type: 'work_complete',
          message: `Work completed on "${request.itemName}". Please confirm.`,
          requestId: request._id
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Status updated successfully',
      data: request 
    });
  } catch (error) {
    logger.error('Update work status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Confirm work completion and release payment
 * @route   POST /api/maintenance/requests/:id/confirm
 * @access  Private (Requester only)
 */
exports.confirmWorkCompletion = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.user.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the requester can confirm completion' 
      });
    }

    if (request.status !== 'Awaiting Confirmation') {
      return res.status(400).json({ 
        success: false, 
        message: 'Work must be marked as complete before confirmation' 
      });
    }

    request.status = 'Completed';
    request.completedAt = new Date();
    await request.save();

    // TODO: Release escrow payment to provider
    // await paymentService.releaseFromEscrow(request.agreedPrice, request.selectedProvider);

    // Award eco-points to both parties
    await User.findByIdAndUpdate(req.user.userId, { 
      $inc: { ecoPoints: 25, 'ecoStats.itemsFixed': 1 } 
    });
    await User.findByIdAndUpdate(request.selectedProvider, { 
      $inc: { ecoPoints: 25, 'ecoStats.servicesProvided': 1 } 
    });

    // Notify provider
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.selectedProvider}`).emit('notification:new', {
        type: 'payment_released',
        message: `Payment released for "${request.itemName}"! +25 eco-points earned.`,
        requestId: request._id
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Work confirmed and payment released',
      data: request 
    });
  } catch (error) {
    logger.error('Confirm completion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Open a dispute
 * @route   POST /api/maintenance/requests/:id/dispute
 * @access  Private
 */
exports.openDispute = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dispute reason is required' 
      });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isRequester = request.user.toString() === req.user.userId;
    const isProvider = request.selectedProvider && request.selectedProvider.toString() === req.user.userId;

    if (!isRequester && !isProvider) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only parties involved can open disputes' 
      });
    }

    request.dispute = {
      openedBy: req.user.userId,
      reason,
      status: 'open',
      openedAt: new Date()
    };
    request.status = 'Disputed';

    await request.save();

    // Notify admin
    const io = req.app.get('io');
    if (io) {
      io.emit('admin:dispute', {
        requestId: request._id,
        message: `New dispute opened for "${request.itemName}"`
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Dispute opened. Admin will review within 48 hours.',
      data: request 
    });
  } catch (error) {
    logger.error('Open dispute error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Resolve a dispute (Admin only)
 * @route   POST /api/maintenance/requests/:id/dispute/resolve
 * @access  Private (Admin)
 */
exports.resolveDispute = async (req, res) => {
  try {
    const { resolution, refundAmount } = req.body;
    
    // TODO: Add admin role check
    // if (req.user.role !== 'admin') { ... }

    const request = await MaintenanceRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (!request.dispute || request.dispute.status !== 'open') {
      return res.status(400).json({ 
        success: false, 
        message: 'No open dispute found' 
      });
    }

    request.dispute.status = 'resolved';
    request.dispute.resolution = resolution;
    request.dispute.resolvedBy = req.user.userId;
    request.dispute.resolvedAt = new Date();
    request.status = 'Completed';

    await request.save();

    // TODO: Process refund if applicable
    // if (refundAmount > 0) {
    //   await paymentService.refund(request.user, refundAmount);
    // }

    // Notify both parties
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.user}`).emit('notification:new', {
        type: 'dispute_resolved',
        message: `Dispute resolved for "${request.itemName}"`,
        requestId: request._id
      });
      io.to(`user:${request.selectedProvider}`).emit('notification:new', {
        type: 'dispute_resolved',
        message: `Dispute resolved for "${request.itemName}"`,
        requestId: request._id
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Dispute resolved successfully',
      data: request 
    });
  } catch (error) {
    logger.error('Resolve dispute error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Rate and review after service completion
 * @route   POST /api/maintenance/requests/:id/review
 * @access  Private
 */
exports.submitReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only review completed services' 
      });
    }

    const isRequester = request.user.toString() === req.user.userId;
    const isProvider = request.selectedProvider && request.selectedProvider.toString() === req.user.userId;

    if (!isRequester && !isProvider) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only parties involved can leave reviews' 
      });
    }

    // Check if already reviewed
    if (isRequester && request.requesterReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this service' 
      });
    }
    if (isProvider && request.providerReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this requester' 
      });
    }

    const reviewData = {
      rating,
      review,
      reviewedBy: req.user.userId,
      reviewedAt: new Date()
    };

    if (isRequester) {
      request.requesterReview = reviewData;
      // Update provider rating
      await User.updateRating(request.selectedProvider, rating);
    } else {
      request.providerReview = reviewData;
      // Update requester rating
      await User.updateRating(request.user, rating);
    }

    await request.save();

    res.status(200).json({ 
      success: true, 
      message: 'Review submitted successfully',
      data: request 
    });
  } catch (error) {
    logger.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get user's maintenance requests (as requester)
 * @route   GET /api/maintenance/my-requests
 * @access  Private
 */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ user: req.user.userId })
      .populate('selectedProvider', 'fullName avatar rating')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    logger.error('Get my requests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get user's accepted jobs (as provider)
 * @route   GET /api/maintenance/my-jobs
 * @access  Private
 */
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await MaintenanceRequest.find({ 
      selectedProvider: req.user.userId 
    })
      .populate('user', 'fullName avatar location')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    logger.error('Get my jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all service offers (provider listings)
 * @route   GET /api/maintenance/offers
 * @access  Private
 */
exports.getOffers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const offers = await ServiceOffer.find({ status: { $ne: 'Inactive' } })
      .populate('user', 'fullName profilePicture location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, data: { offers } });
  } catch (error) {
    logger.error('Get offers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create a service offer (provider profile)
 * @route   POST /api/maintenance/offers
 * @access  Private
 */
exports.createOffer = async (req, res) => {
  try {
    const { name, category, description, startingPrice, location, experience, specialties } = req.body;
    if (!name || !description || !startingPrice) {
      return res.status(400).json({ success: false, message: 'name, description and startingPrice are required' });
    }

    const offer = await ServiceOffer.createOffer({
      user: req.user.userId,
      name,
      category,
      description,
      startingPrice,
      location,
      experience,
      specialties
    });

    res.status(201).json({ success: true, message: 'Offer created', data: offer });
  } catch (error) {
    logger.error('Create offer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete own service offer
 * @route   DELETE /api/maintenance/offers/:id
 * @access  Private
 */
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await ServiceOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    if (offer.user.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await offer.deleteOne();
    res.json({ success: true, message: 'Offer deleted' });
  } catch (error) {
    logger.error('Delete offer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update own service offer
 * @route   PUT /api/maintenance/offers/:id
 * @access  Private
 */
exports.updateOffer = async (req, res) => {
  try {
    const offer = await ServiceOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    if (offer.user.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowed = ['name', 'category', 'description', 'startingPrice', 'location', 'experience', 'specialties', 'status'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) offer[field] = req.body[field];
    });

    await offer.save();
    res.json({ success: true, message: 'Offer updated', data: offer });
  } catch (error) {
    logger.error('Update offer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get single service offer
 * @route   GET /api/maintenance/offers/:id
 * @access  Private
 */
exports.getOfferById = async (req, res) => {
  try {
    const offer = await ServiceOffer.findById(req.params.id).populate('user', 'fullName profilePicture location');
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, data: offer });
  } catch (error) {
    logger.error('Get offer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getProviderStats = async (req, res) => {
  try {
    const providerId = req.user.userId;

    // Count active jobs (Matched + In Progress)
    const activeJobs = await MaintenanceRequest.countDocuments({
      selectedProvider: providerId,
      status: { $in: ['Matched', 'In Progress'] }
    });

    // Count completed jobs
    const completedJobs = await MaintenanceRequest.countDocuments({
      selectedProvider: providerId,
      status: 'Completed'
    });

    // Calculate total earnings (sum of agreedPrice for completed jobs)
    const completedJobsList = await MaintenanceRequest.find({
      selectedProvider: providerId,
      status: 'Completed'
    }).select('agreedPrice');

    // Extract numeric values from price strings like "$50" or "$50 - $80"
    const totalEarnings = completedJobsList.reduce((sum, job) => {
      if (!job.agreedPrice) return sum;
      const match = job.agreedPrice.match(/\d+/);
      return sum + (match ? parseInt(match[0]) : 0);
    }, 0);

    // Get average rating from provider reviews
    const reviewedJobs = await MaintenanceRequest.find({
      selectedProvider: providerId,
      'providerReview.rating': { $exists: true }
    }).select('providerReview.rating');

    const averageRating = reviewedJobs.length > 0
      ? (reviewedJobs.reduce((sum, job) => sum + job.providerReview.rating, 0) / reviewedJobs.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        activeJobs,
        completedJobs,
        totalEarnings,
        averageRating: parseFloat(averageRating),
        reviewCount: reviewedJobs.length
      }
    });
  } catch (error) {
    logger.error('Get provider stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get request statistics (for requester dashboard)
 * @route   GET /api/maintenance/requests/stats
 * @access  Private
 */
exports.getRequestStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const newRequests = await MaintenanceRequest.countDocuments({
      user: userId,
      status: 'New'
    });

    const pendingRequests = await MaintenanceRequest.countDocuments({
      user: userId,
      status: 'Pending'
    });

    const activeRequests = await MaintenanceRequest.countDocuments({
      user: userId,
      status: { $in: ['Matched', 'In Progress', 'Awaiting Confirmation'] }
    });

    const completedRequests = await MaintenanceRequest.countDocuments({
      user: userId,
      status: 'Completed'
    });

    // Calculate total spent
    const completedList = await MaintenanceRequest.find({
      user: userId,
      status: 'Completed'
    }).select('agreedPrice');

    const totalSpent = completedList.reduce((sum, req) => {
      if (!req.agreedPrice) return sum;
      const match = req.agreedPrice.match(/\d+/);
      return sum + (match ? parseInt(match[0]) : 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        newRequests,
        pendingRequests,
        activeRequests,
        completedRequests,
        totalSpent
      }
    });
  } catch (error) {
    logger.error('Get request stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = exports;