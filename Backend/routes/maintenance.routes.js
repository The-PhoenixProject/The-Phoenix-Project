// routes/maintenance.routes.js - COMPLETE WITH ALL FEATURES + STATS
const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const verifyToken = require('../middlewares/auth.middleware');

// ==========================================
// STATISTICS ROUTES (Must be BEFORE :id routes to avoid conflicts)
// ==========================================

/**
 * @route   GET /api/maintenance/provider/stats
 * @desc    Get provider statistics for dashboard
 * @access  Private
 */
router.get('/provider/stats', verifyToken, maintenanceController.getProviderStats);

/**
 * @route   GET /api/maintenance/requests/stats
 * @desc    Get requester statistics for dashboard
 * @access  Private
 */
router.get('/requests/stats', verifyToken, maintenanceController.getRequestStats);

// ==========================================
// MAINTENANCE REQUESTS
// ==========================================

/**
 * @route   GET /api/maintenance/requests
 * @desc    Get all maintenance requests (browse marketplace)
 * @access  Private
 */
router.get('/requests', verifyToken, maintenanceController.getRequests);

/**
 * @route   POST /api/maintenance/requests
 * @desc    Create a new maintenance request
 * @access  Private
 */
router.post('/requests', verifyToken, maintenanceController.createRequest);

/**
 * @route   GET /api/maintenance/my-requests
 * @desc    Get all requests created by current user
 * @access  Private
 */
router.get('/my-requests', verifyToken, maintenanceController.getMyRequests);

/**
 * @route   GET /api/maintenance/requests/:id
 * @desc    Get single request with full details (offers, status, etc.)
 * @access  Private
 */
router.get('/requests/:id', verifyToken, maintenanceController.getRequestById);

/**
 * @route   DELETE /api/maintenance/requests/:id
 * @desc    Delete own maintenance request (soft delete)
 * @access  Private
 */
router.delete('/requests/:id', verifyToken, maintenanceController.deleteRequest);

// ==========================================
// SERVICE OFFERS & APPLICATIONS
// ==========================================

/**
 * @route   POST /api/maintenance/requests/:id/apply
 * @desc    Service provider submits an offer for a request
 * @access  Private
 */
router.post('/requests/:id/apply', verifyToken, maintenanceController.applyToRequest);

/**
 * @route   POST /api/maintenance/requests/:id/offers/:offerId/accept
 * @desc    Requester accepts a service offer
 * @access  Private
 */
router.post(
  '/requests/:id/offers/:offerId/accept',
  verifyToken,
  maintenanceController.acceptOffer
);

/**
 * @route   POST /api/maintenance/requests/:id/offers/:offerId/reject
 * @desc    Requester rejects a service offer
 * @access  Private
 */
router.post(
  '/requests/:id/offers/:offerId/reject',
  verifyToken,
  maintenanceController.rejectOffer
);

// ==========================================
// WORK STATUS MANAGEMENT
// ==========================================

/**
 * @route   PATCH /api/maintenance/requests/:id/status
 * @desc    Update work status (start work, mark complete, etc.)
 * @access  Private
 */
router.patch('/requests/:id/status', verifyToken, maintenanceController.updateWorkStatus);

/**
 * @route   POST /api/maintenance/requests/:id/confirm
 * @desc    Requester confirms work completion and releases payment
 * @access  Private
 */
router.post('/requests/:id/confirm', verifyToken, maintenanceController.confirmWorkCompletion);

/**
 * @route   GET /api/maintenance/my-jobs
 * @desc    Get all jobs accepted by current user (as service provider)
 * @access  Private
 */
router.get('/my-jobs', verifyToken, maintenanceController.getMyJobs);

// ==========================================
// DISPUTES
// ==========================================

/**
 * @route   POST /api/maintenance/requests/:id/dispute
 * @desc    Open a dispute for a request
 * @access  Private
 */
router.post('/requests/:id/dispute', verifyToken, maintenanceController.openDispute);

/**
 * @route   POST /api/maintenance/requests/:id/dispute/resolve
 * @desc    Resolve a dispute (Admin only)
 * @access  Private (Admin)
 */
router.post(
  '/requests/:id/dispute/resolve',
  verifyToken,
  maintenanceController.resolveDispute
);

// ==========================================
// REVIEWS & RATINGS
// ==========================================

/**
 * @route   POST /api/maintenance/requests/:id/review
 * @desc    Submit a review after service completion
 * @access  Private
 */
router.post('/requests/:id/review', verifyToken, maintenanceController.submitReview);

// ==========================================
// SERVICE OFFERS (Provider Profile)
// ==========================================

/**
 * @route   GET /api/maintenance/offers
 * @desc    Get all service offers (service provider listings)
 * @access  Private
 */
router.get('/offers', verifyToken, maintenanceController.getOffers);

/**
 * @route   POST /api/maintenance/offers
 * @desc    Create a service offer (list your service)
 * @access  Private
 */
router.post('/offers', verifyToken, maintenanceController.createOffer);

/**
 * @route   GET /api/maintenance/offers/:id
 * @desc    Get single service offer details
 * @access  Private
 */
router.get('/offers/:id', verifyToken, maintenanceController.getOfferById);

/**
 * @route   PUT /api/maintenance/offers/:id
 * @desc    Update own service offer
 * @access  Private
 */
router.put('/offers/:id', verifyToken, maintenanceController.updateOffer);

/**
 * @route   DELETE /api/maintenance/offers/:id
 * @desc    Delete own service offer
 * @access  Private
 */
router.delete('/offers/:id', verifyToken, maintenanceController.deleteOffer);

// ==========================================
// ADDITIONAL FEATURES (Optional - for future enhancements)
// ==========================================

/**
 * @route   POST /api/maintenance/requests/:id/photos
 * @desc    Upload before/after photos for completed work
 * @access  Private
 */
// router.post('/requests/:id/photos', verifyToken, upload.array('photos', 5), maintenanceController.uploadWorkPhotos);

/**
 * @route   GET /api/maintenance/requests/search
 * @desc    Search maintenance requests with filters
 * @access  Private
 */
// router.get('/requests/search', verifyToken, maintenanceController.searchRequests);

module.exports = router;