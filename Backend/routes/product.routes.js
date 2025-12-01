// routes/product.routes.js - Updated with all endpoints
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const verifyToken = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
  }
});

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected Routes - User's products
router.get('/my/products', verifyToken, productController.getMyProducts);
router.get('/my/wishlist', verifyToken, productController.getWishlist);

// Protected Routes - CRUD
router.post('/', verifyToken, upload.array('images', 5), productController.createProduct);
router.put('/:id', verifyToken, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);

// Protected Routes - Actions
router.post('/:id/wishlist', verifyToken, productController.toggleWishlist);
router.post('/:id/sold', verifyToken, productController.markAsSold);

module.exports = router;