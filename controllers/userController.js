const prisma = require('../config/db');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phone, avatar } = req.body;

        // We only allow updating basic fields, not email/firebaseUid which are handled by Firebase
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { fullName, phone, avatar }
        });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};

// --- ADDRESSES ---

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private (CUSTOMER)
exports.getAddresses = async (req, res) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.user.id }
        });
        res.status(200).json({ success: true, count: addresses.length, data: addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving addresses' });
    }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private (CUSTOMER)
exports.addAddress = async (req, res) => {
    try {
        const { label, address, city, area, isDefault } = req.body;

        if (isDefault) {
            // Unset previous defaults
            await prisma.address.updateMany({
                where: { userId: req.user.id, isDefault: true },
                data: { isDefault: false }
            });
        }

        const newAddress = await prisma.address.create({
            data: {
                userId: req.user.id,
                label,
                address,
                city,
                area,
                isDefault: isDefault || false
            }
        });

        res.status(201).json({ success: true, data: newAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error adding address' });
    }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private (CUSTOMER)
exports.deleteAddress = async (req, res) => {
    try {
        const addr = await prisma.address.findUnique({ where: { id: req.params.id } });
        if (!addr || addr.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized or not found' });
        }

        await prisma.address.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error deleting address' });
    }
};

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private (CUSTOMER)
exports.updateAddress = async (req, res) => {
    try {
        const addr = await prisma.address.findUnique({ where: { id: req.params.id } });
        if (!addr || addr.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized or not found' });
        }

        const { label, address, city, area, isDefault } = req.body;

        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: req.user.id, isDefault: true },
                data: { isDefault: false }
            });
        }

        const updated = await prisma.address.update({
            where: { id: req.params.id },
            data: {
                label: label ?? addr.label,
                address: address ?? addr.address,
                city: city ?? addr.city,
                area: area ?? addr.area,
                isDefault: isDefault ?? addr.isDefault
            }
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating address' });
    }
};
// --- FAVORITES ---

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private (CUSTOMER)
exports.getFavorites = async (req, res) => {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId: req.user.id },
            include: {
                restaurant: {
                    select: { id: true, name: true, logo: true, rating: true, cuisineTypes: true, deliveryFee: true, delivery: true }
                }
            }
        });
        res.status(200).json({ success: true, count: favorites.length, data: favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving favorites' });
    }
};

// @desc    Toggle favorite status of a restaurant
// @route   POST /api/users/favorites/:restaurantId
// @access  Private (CUSTOMER)
exports.toggleFavorite = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_restaurantId: {
                    userId: req.user.id,
                    restaurantId
                }
            }
        });

        if (existingFavorite) {
            await prisma.favorite.delete({
                where: {
                    userId_restaurantId: { userId: req.user.id, restaurantId }
                }
            });
            res.status(200).json({ success: true, message: 'Removed from favorites' });
        } else {
            const fav = await prisma.favorite.create({
                data: {
                    userId: req.user.id,
                    restaurantId
                }
            });
            res.status(201).json({ success: true, data: fav, message: 'Added to favorites' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error toggling favorite' });
    }
};

// --- REWARDS ---

// @desc    Get user rewards history
// @route   GET /api/users/rewards
// @access  Private (CUSTOMER)
exports.getRewards = async (req, res) => {
    try {
        const rewards = await prisma.reward.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, count: rewards.length, data: rewards });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving rewards' });
    }
};
