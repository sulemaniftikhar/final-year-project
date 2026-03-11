const express = require('express');
const {
    createOrder,
    getOrders,
    updateOrderStatus,
    getOrderById
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(protect);

router
    .route('/')
    .post(authorize('CUSTOMER'), createOrder)
    .get(getOrders); // Handles both CUSTOMER and RESTAURANT logic based on req.user

router
    .route('/:id')
    .get(getOrderById);

router
    .route('/:id/status')
    .patch(authorize('RESTAURANT_OWNER', 'ADMIN'), updateOrderStatus);

module.exports = router;
