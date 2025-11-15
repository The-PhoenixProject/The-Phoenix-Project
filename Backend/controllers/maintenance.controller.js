// controllers/maintenance.controller.js
const MaintenanceRequest = require('../models/maintenance.model');
const ServiceOffer = require('../models/service.model');
const logger = require('../utlis/logger');

/**
 * @desc    Get all maintenance requests
 * @route   GET /api/maintenance/requests
 * @access  Private
 */
exports.getRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate('user', 'fullName location')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    logger.error('Get requests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create maintenance request
 * @route   POST /api/maintenance/requests
 * @access  Private
 */
exports.createRequest = async (req, res) => {
  try {
    const data = { ...req.body, user: req.user.userId };
    const request = await MaintenanceRequest.createRequest(data);
    // Update user
    const User = require('../models/user.model');
    await User.findByIdAndUpdate(req.user.userId, { $push: { maintenanceRequests: request._id } });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    logger.error('Create request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete request
 * @route   DELETE /api/maintenance/requests/:id
 * @access  Private
 */
exports.deleteRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    const User = require('../models/user.model');
    await User.findByIdAndUpdate(req.user.userId, { $pull: { maintenanceRequests: req.params.id } });
    res.status(200).json({ success: true, message: 'Request deleted' });
  } catch (error) {
    logger.error('Delete request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all service offers
 * @route   GET /api/maintenance/offers
 * @access  Private
 */
exports.getOffers = async (req, res) => {
  try {
    const offers = await ServiceOffer.find()
      .populate('user', 'fullName location rating')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    logger.error('Get offers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create service offer
 * @route   POST /api/maintenance/offers
 * @access  Private
 */
exports.createOffer = async (req, res) => {
  try {
    const data = { ...req.body, user: req.user.userId };
    const offer = await ServiceOffer.createOffer(data);
    // Update user
    const User = require('../models/user.model');
    await User.findByIdAndUpdate(req.user.userId, { $push: { serviceOffers: offer._id } });
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    logger.error('Create offer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete offer
 * @route   DELETE /api/maintenance/offers/:id
 * @access  Private
 */
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await ServiceOffer.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    const User = require('../models/user.model');
    await User.findByIdAndUpdate(req.user.userId, { $pull: { serviceOffers: req.params.id } });
    res.status(200).json({ success: true, message: 'Offer deleted' });
  } catch (error) {
    logger.error('Delete offer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Apply to request (add offer to request)
 * @route   POST /api/maintenance/requests/:id/apply
 * @access  Private
 */
exports.applyToRequest = async (req, res) => {
  try {
    const { price, message } = req.body;
    const offerData = { provider: req.user.userId, price, message };
    const request = await MaintenanceRequest.addOffer(req.params.id, offerData);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    logger.error('Apply to request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};