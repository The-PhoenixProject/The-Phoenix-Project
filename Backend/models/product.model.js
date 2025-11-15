// models/product.model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Used']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Furniture',
      'Electronics',
      'Home Decor',
      'Books & Media',
      'Sporting Goods',
      'Toys & Games',
      'Crafts & DIY Materials',
      'Jewelry',
      'Miscellaneous'
    ]
  },
  
  images: [{
    type: String,
    required: true
  }],
  
  image: {
    type: String,
    required: true
  },
  
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  sellerName: {
    type: String,
    required: true
  },
  
  location: {
    type: String,
    trim: true
  },
  
  isEcoFriendly: {
    type: Boolean,
    default: false
  },
  
  isUpcycled: {
    type: Boolean,
    default: false
  },
  
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;