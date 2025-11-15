// controllers/product.controller.js - ✅ COMPLETE WITH WISHLIST
const Product = require('../models/product.model');
const User = require('../models/user.model');

// === GET ALL PRODUCTS (Marketplace - Public/Protected) ===
exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      condition,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    // Build query
    let query = { status: 'available' }; // Only show available products

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by keyword
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch products with populated seller
    let products = await Product.find(query)
      .populate('seller', 'fullName email profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(); // ✅ Use lean for better performance

    // ✅ If user is logged in, check wishlist
    if (req.user && req.user.userId) {
      const user = await User.findById(req.user.userId).select('wishlist').lean();
      
      if (user && user.wishlist) {
        const wishlistIds = user.wishlist.map(id => id.toString());
        
        products = products.map(product => ({
          ...product,
          isFavorited: wishlistIds.includes(product._id.toString())
        }));
      }
    }

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

// === GET SINGLE PRODUCT (Modal - Public/Protected) ===
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'fullName email profilePicture location')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // ✅ Check if product is in wishlist
    if (req.user && req.user.userId) {
      const user = await User.findById(req.user.userId).select('wishlist').lean();
      
      if (user && user.wishlist) {
        product.isFavorited = user.wishlist.some(
          id => id.toString() === product._id.toString()
        );
      }
    }

    // Increment views
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// === CREATE PRODUCT (Profile - Protected) ===
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      condition,
      category,
      isEcoFriendly,
      isUpcycled,
      location
    } = req.body;

    // Validate required image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required',
      });
    }

    const product = new Product({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      condition,
      category,
      image: `/uploads/${req.file.filename}`,
      images: [`/uploads/${req.file.filename}`],
      isEcoFriendly: isEcoFriendly === 'true' || isEcoFriendly === true,
      isUpcycled: isUpcycled === 'true' || isUpcycled === true,
      seller: req.user.userId,
      sellerName: req.dbUser.fullName,
      location: location || req.dbUser.location
    });

    await product.save();
    
    // Update user's products array
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { products: product._id },
      $inc: { productsCount: 1 }
    });

    await product.populate('seller', 'fullName email profilePicture');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

// === GET MY PRODUCTS (Profile - Protected) ===
exports.getMyProducts = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { seller: req.user.userId };
    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate('seller', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('getMyProducts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// === UPDATE PRODUCT (Profile - Protected) ===
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update fields
    const allowedFields = ['title', 'description', 'price', 'condition', 'category', 'isEcoFriendly', 'isUpcycled', 'status', 'location'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // Update image if provided
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
      product.images = [`/uploads/${req.file.filename}`];
    }

    await product.save();
    await product.populate('seller', 'fullName email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// === DELETE PRODUCT (Profile - Protected) ===
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await product.deleteOne();

    // Remove from user's products array
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { products: product._id },
      $inc: { productsCount: -1 }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// === TOGGLE WISHLIST (Protected) ===
exports.toggleWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.userId;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get user
    const user = await User.findById(userId);
    
    // Check if product is already in wishlist
    const wishlistIndex = user.wishlist.findIndex(
      id => id.toString() === productId
    );

    let isFavorited;
    let message;

    if (wishlistIndex === -1) {
      // Add to wishlist
      user.wishlist.push(productId);
      isFavorited = true;
      message = 'Added to wishlist';
    } else {
      // Remove from wishlist
      user.wishlist.splice(wishlistIndex, 1);
      isFavorited = false;
      message = 'Removed from wishlist';
    }

    await user.save();

    res.json({
      success: true,
      message,
      data: { isFavorited }
    });
  } catch (error) {
    console.error('toggleWishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist'
    });
  }
};

// === GET WISHLIST (Protected) ===
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'wishlist',
        populate: {
          path: 'seller',
          select: 'fullName email profilePicture'
        }
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark all wishlist products as favorited
    const products = (user.wishlist || []).map(product => ({
      ...product,
      isFavorited: true
    }));

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('getWishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
};