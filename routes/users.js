const express = require('express');
const {
    updateProfile,
    getAddresses,
    addAddress,
    deleteAddress,
    getFavorites,
    toggleFavorite,
    getRewards
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are private
router.use(protect);

router.route('/profile').put(updateProfile);

// Customer-centric routes (Optional check depending on business logic, but typically safe for customers)
router.use(authorize('CUSTOMER'));

// Addresses
router.route('/addresses')
    .get(getAddresses)
    .post(addAddress);

router.route('/addresses/:id')
    .put((req, res, next) => require('../controllers/userController').updateAddress(req, res, next))
    .delete(deleteAddress);

// Favorites
router.route('/favorites')
    .get(getFavorites);

router.route('/favorites/:restaurantId')
    .post(toggleFavorite);

// Rewards
router.route('/rewards')
    .get(getRewards);

module.exports = router;
