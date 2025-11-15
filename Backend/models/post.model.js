// models/post.model.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  // ✅ CHANGED: Single media object instead of array
  media: {
    url: String,
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['recycling', 'upcycling', 'story', 'tip', 'other'],
    default: 'other'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0
  },
  isSaved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
postSchema.index({ user: 1, createdAt: -1 });

// Static methods
postSchema.statics.createPost = async function(data) {
  const post = await this.create(data);
  const User = require('./user.model');
  await User.findByIdAndUpdate(
    data.user, 
    { 
      $inc: { postsCount: 1 }, 
      $push: { posts: post._id } 
    }
  );
  return post;
};

postSchema.statics.deletePost = async function(postId, userId) {
  const post = await this.findOneAndDelete({ _id: postId, user: userId });
  if (post) {
    const User = require('./user.model');
    await User.findByIdAndUpdate(
      userId, 
      { 
        $inc: { postsCount: -1 }, 
        $pull: { posts: postId } 
      }
    );
  }
  return post;
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;