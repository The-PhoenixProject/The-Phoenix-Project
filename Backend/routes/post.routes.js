// routes/post.routes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const verifyToken = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');

// ✅ Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// ✅ Routes
router.get('/feed', verifyToken, postController.getPosts);
router.get('/my', verifyToken, postController.getMyPosts); // ✅ ADDED - Get user's own posts
router.post('/', verifyToken, upload.single('media'), postController.createPost); // ✅ FIXED - Added multer
router.put('/:id', verifyToken, postController.updatePost);
router.delete('/:id', verifyToken, postController.deletePost);
router.post('/:id/like', verifyToken, postController.likePost);
router.post('/:id/comment', verifyToken, postController.commentPost);

module.exports = router;