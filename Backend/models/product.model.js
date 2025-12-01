// models/product.model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
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
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Used']
  },
  images: [{
    type: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  isEcoFriendly: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'deleted'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  soldAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: 'text', description: 'text' });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;