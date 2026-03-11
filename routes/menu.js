const express = require('express');
const {
    getMenu,
    createCategory,
    createMenuItem,
    updateMenuItem,
    toggleStock
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

// Note: { mergeParams: true } allows us to access :restaurantId from the parent router
const router = express.Router({ mergeParams: true });

// @route   /api/restaurants/:restaurantId/menu
router.route('/')
    .get(getMenu);

// Category Routes
router.route('/categories')
    .post(protect, authorize('RESTAURANT_OWNER', 'ADMIN'), createCategory);

// Menu Item Routes
router.route('/items')
    .post(protect, authorize('RESTAURANT_OWNER', 'ADMIN'), createMenuItem);

router.route('/items/:id')
    .put(protect, authorize('RESTAURANT_OWNER', 'ADMIN'), updateMenuItem);

router.route('/items/:id/stock')
    .patch(protect, authorize('RESTAURANT_OWNER', 'ADMIN'), toggleStock);

module.exports = router;
