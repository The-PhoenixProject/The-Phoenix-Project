// server.js - COMPLETE WITH SOCKET.IO
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database.config');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ==========================================
// Socket.IO Configuration
// ==========================================
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store active users
const activeUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`✅ User connected: ${userId} (${socket.id})`);

  // Store active user
  activeUsers.set(userId, socket.id);
  userSockets.set(socket.id, userId);

  // Broadcast user online status
  socket.broadcast.emit('user:online', { userId });

  // Join user's personal room
  socket.join(`user:${userId}`);

  // Join conversation rooms
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Send message
  socket.on('message:send', async (data) => {
    const { conversationId, message } = data;
    
    try {
      // Broadcast to conversation room
      io.to(`conversation:${conversationId}`).emit('message:new', {
        conversationId,
        message,
        senderId: userId,
        timestamp: new Date()
      });

      // Send notification to other participants
      socket.to(`conversation:${conversationId}`).emit('notification:new', {
        type: 'message',
        conversationId,
        message: message.substring(0, 50),
        senderId: userId
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing:start', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:start', {
      conversationId,
      userId
    });
  });

  socket.on('typing:stop', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:stop', {
      conversationId,
      userId
    });
  });

  // Message read receipt
  socket.on('message:read', ({ conversationId, messageIds }) => {
    socket.to(`conversation:${conversationId}`).emit('message:read', {
      conversationId,
      messageIds,
      readBy: userId
    });
  });

  // Message deleted
  socket.on('message:delete', ({ conversationId, messageId, deleteForEveryone }) => {
    if (deleteForEveryone) {
      io.to(`conversation:${conversationId}`).emit('message:deleted', {
        conversationId,
        messageId
      });
    }
  });

  // Message pinned
  socket.on('message:pin', ({ conversationId, messageId }) => {
    io.to(`conversation:${conversationId}`).emit('message:pinned', {
      conversationId,
      messageId
    });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${userId} (${socket.id})`);
    
    activeUsers.delete(userId);
    userSockets.delete(socket.id);
    
    // Broadcast user offline status
    socket.broadcast.emit('user:offline', { userId });
  });
});

// Make io accessible to routes
app.set('io', io);
app.set('activeUsers', activeUsers);

// ==========================================
// Middlewares
// ==========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ==========================================
// Routes
// ==========================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Phoenix Project Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      conversations: '/api/conversations',
      posts: '/api/posts',
      maintenance: '/api/maintenance'
    },
    features: {
      websocket: 'enabled',
      realTimeChat: 'enabled',
      notifications: 'enabled'
    }
  });
});

// Import routes
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const productRoutes = require('./routes/product.routes');
const conversationRoutes = require('./routes/conversation.routes');
const postRoutes = require('./routes/post.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const ecoPointsRoutes = require('./routes/ecoPoints.routes');


// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/eco-points', ecoPointsRoutes);

// ==========================================
// Error Handling
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔌 WebSocket enabled`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = { app, server, io };
