// controllers/product.controller.js - Updated with Eco Points Integration
const Product = require('../models/product.model');
const User = require('../models/user.model');
const EcoPointsService = require('../services/ecoPoints.service');
const logger = require('../utlis/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Get all products with filters
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, condition, minPrice, maxPrice, search, isEcoFriendly, sort, page = 1, limit = 20 } = req.query;
    
    const filter = { status: { $ne: 'deleted' } };
    
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (isEcoFriendly === 'true') filter.isEcoFriendly = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'fullName profilePicture location ecoPoints level')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    const API_BASE_URL = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const mapped = products.map(p => ({
      ...p,
      images: (p.images || []).map(img => img.startsWith('http') ? img : `${API_BASE_URL}/${img}`)
    }));

    res.json({
      success: true,
      data: { 
        products: mapped,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'fullName profilePicture location ecoPoints level bio followersCount')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const API_BASE_URL = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    product.images = (product.images || []).map(img => 
      img.startsWith('http') ? img : `${API_BASE_URL}/${img}`
    );

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, data: { product } });
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private
 */
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, location, isEcoFriendly } = req.body;

    if (!title || !price || !category || !condition) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, price, category and condition are required' 
      });
    }

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`uploads/${file.filename}`);
      });
    }

    if (images.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one image is required' 
      });
    }

    const product = await Product.create({
      title,
      description: description || '',
      price: parseFloat(price),
      category,
      condition,
      location: location || '',
      isEcoFriendly: isEcoFriendly === 'true' || isEcoFriendly === true,
      images,
      seller: req.user.userId,
      status: 'available'
    });

    // Update user's products count
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { productsCount: 1 },
      $push: { products: product._id }
    });

    // Award eco points for adding product
    const pointsResult = await EcoPointsService.awardPoints(req.user.userId, 'addProduct');

    // Populate seller info
    await product.populate('seller', 'fullName profilePicture');

    const API_BASE_URL = process.env.API_URL || `${req.protocol}://${req.get('host')}`;

    logger.info(`Product created: ${product._id} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: {
          ...product.toObject(),
          images: product.images.map(img => `${API_BASE_URL}/${img}`)
        },
        ecoPoints: pointsResult
      }
    });
  } catch (error) {
    logger.error('Create product error:', error);
    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Owner only)
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, price, category, condition, location, isEcoFriendly, status } = req.body;

    // Update fields
    if (title) product.title = title;
    if (description !== undefined) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (condition) product.condition = condition;
    if (location !== undefined) product.location = location;
    if (isEcoFriendly !== undefined) product.isEcoFriendly = isEcoFriendly === 'true' || isEcoFriendly === true;
    if (status) product.status = status;

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `uploads/${file.filename}`);
      product.images = [...product.images, ...newImages].slice(0, 5); // Max 5 images
    }

    await product.save();
    await product.populate('seller', 'fullName profilePicture');

    const API_BASE_URL = process.env.API_URL || `${req.protocol}://${req.get('host')}`;

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: {
          ...product.toObject(),
          images: product.images.map(img => img.startsWith('http') ? img : `${API_BASE_URL}/${img}`)
        }
      }
    });
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Owner only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Soft delete
    product.status = 'deleted';
    await product.save();

    // Update user's products count
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { productsCount: -1 },
      $pull: { products: product._id }
    });

    logger.info(`Product deleted: ${product._id} by user ${req.user.userId}`);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get current user's products
 * @route   GET /api/products/my/products
 * @access  Private
 */
exports.getMyProducts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { seller: req.user.userId, status: { $ne: 'deleted' } };
    if (status) filter.status = status;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const API_BASE_URL = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const mapped = products.map(p => ({
      ...p,
      images: (p.images || []).map(img => img.startsWith('http') ? img : `${API_BASE_URL}/${img}`)
    }));

    res.json({ success: true, data: { products: mapped } });
  } catch (error) {
    logger.error('Get my products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Toggle wishlist
 * @route   POST /api/products/:id/wishlist
 * @access  Private
 */
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const index = user.wishlist.indexOf(productId);
    let isWishlisted;

    if (index === -1) {
      user.wishlist.push(productId);
      isWishlisted = true;
    } else {
      user.wishlist.splice(index, 1);
      isWishlisted = false;
    }

    await user.save();

    res.json({
      success: true,
      message: isWishlisted ? 'Added to wishlist' : 'Removed from wishlist',
      data: { isWishlisted }
    });
  } catch (error) {
    logger.error('Toggle wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get user's wishlist
 * @route   GET /api/products/my/wishlist
 * @access  Private
 */
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'wishlist',
        populate: { path: 'seller', select: 'fullName profilePicture' }
      })
      .lean();

    const API_BASE_URL = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const products = (user.wishlist || []).map(p => ({
      ...p,
      images: (p.images || []).map(img => img.startsWith('http') ? img : `${API_BASE_URL}/${img}`)
    }));

    res.json({ success: true, data: { products } });
  } catch (error) {
    logger.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Mark product as sold (awards points to seller)
 * @route   POST /api/products/:id/sold
 * @access  Private (Owner only)
 */
exports.markAsSold = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (product.status === 'sold') {
      return res.status(400).json({ success: false, message: 'Product already sold' });
    }

    product.status = 'sold';
    product.soldAt = new Date();
    await product.save();

    // Check if this is the user's first sale
    const soldCount = await Product.countDocuments({ 
      seller: req.user.userId, 
      status: 'sold' 
    });

    // Award eco points for selling
    const pointsResult = await EcoPointsService.awardPoints(
      req.user.userId, 
      'sellProduct',
      { isFirstSale: soldCount === 1 }
    );

    logger.info(`Product sold: ${product._id} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Product marked as sold',
      data: {
        product,
        ecoPoints: pointsResult
      }
    });
  } catch (error) {
    logger.error('Mark as sold error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
