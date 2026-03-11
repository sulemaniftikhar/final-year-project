require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: '*', // Configure this to frontend URL in production
        methods: ['GET', 'POST']
    }
});

app.set('io', io); // Make IO accessible in routes

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiter — generous for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // increased from 100 to handle dev hot-reloads & multiple tabs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Relaxed limiter specifically for /api/auth/me
// AuthContext calls this on every page load/render, so it needs a high limit
const authMeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/me', authMeLimiter);

// Basic Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'OrderIQ API is running' });
});

// Routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Restaurant room
    socket.on('join_restaurant', (restaurantId) => {
        socket.join(`restaurant_${restaurantId}`);
        console.log(`Socket ${socket.id} joined restaurant_${restaurantId}`);
    });

    // Order tracking room
    socket.on('join_order', (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`Socket ${socket.id} joined order_${orderId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
