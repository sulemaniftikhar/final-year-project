const express = require('express');
const {
    getDashboardStats,
    getAllRestaurants,
    getAllUsers,
    getAllOrders,
    updateRestaurantStatus,
    updateUserStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);

router.route('/restaurants').get(getAllRestaurants);
router.route('/restaurants/:id/status').patch(updateRestaurantStatus);

router.route('/users').get(getAllUsers);
router.route('/users/:id/status').patch(updateUserStatus);

router.route('/orders').get(getAllOrders);

module.exports = router;

