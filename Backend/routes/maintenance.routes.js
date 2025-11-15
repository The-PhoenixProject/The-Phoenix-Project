// routes/maintenance.route.js
const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Requests
router.get('/requests', verifyToken, maintenanceController.getRequests);
router.post('/requests', verifyToken, maintenanceController.createRequest);
router.delete('/requests/:id', verifyToken, maintenanceController.deleteRequest);
router.post('/requests/:id/apply', verifyToken, maintenanceController.applyToRequest);

// Offers/Services
router.get('/offers', verifyToken, maintenanceController.getOffers);
router.post('/offers', verifyToken, maintenanceController.createOffer);
router.delete('/offers/:id', verifyToken, maintenanceController.deleteOffer);

module.exports = router;