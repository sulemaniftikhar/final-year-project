const express = require('express');
const {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    getMyRestaurants
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

// We also need to map nested menu & team routing 
const menuRouter = require('./menu');
const teamRouter = require('./team');

const router = express.Router();

// Re-route into other resource routers for clean endpoints
// e.g. GET /api/restaurants/:restaurantId/menu
router.use('/:restaurantId/menu', menuRouter);
router.use('/:restaurantId/team', teamRouter);

router
    .route('/')
    .get(getRestaurants)
    .post(protect, authorize('RESTAURANT_OWNER', 'ADMIN'), createRestaurant);

router.route('/mine').get(protect, authorize('RESTAURANT_OWNER', 'ADMIN'), getMyRestaurants);

router
    .route('/:id')
    .get(getRestaurantById)
    .put(protect, authorize('RESTAURANT_OWNER', 'ADMIN'), updateRestaurant);

module.exports = router;
