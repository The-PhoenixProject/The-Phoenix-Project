const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const verifyToken = require('../middlewares/auth.middleware');
const upload = require('../config/multer.config');

// Optional auth middleware for public routes
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

// ✅ PUBLIC ROUTES (optional auth for wishlist status)
router.get('/', optionalAuth, productController.getAllProducts);
router.get('/:id', optionalAuth, productController.getProductById);

// ✅ PROTECTED ROUTES
router.post('/', verifyToken, upload.single('image'), productController.createProduct);
router.get('/my/products', verifyToken, productController.getMyProducts);
router.put('/:id', verifyToken, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);

// ✅ WISHLIST ROUTES
router.post('/:id/wishlist', verifyToken, productController.toggleWishlist);
router.get('/my/wishlist', verifyToken, productController.getWishlist);

module.exports = router;