const prisma = require('../config/db');

// @desc    Get all active restaurants with optional filters
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
    try {
        const { search, cuisine, type } = req.query;

        const whereClause = { status: 'OPEN' }; // Only fetch open restaurants for customers

        if (search) {
            whereClause.name = { contains: search, mode: 'insensitive' };
        }

        if (cuisine) {
            whereClause.cuisineTypes = { has: cuisine };
        }

        if (type) {
            if (type === 'delivery') whereClause.delivery = true;
            if (type === 'pickup') whereClause.takeaway = true;
            if (type === 'dinein') whereClause.dineIn = true;
        }

        const restaurants = await prisma.restaurant.findMany({
            where: whereClause,
            include: {
                categories: { select: { id: true } }
            }
        });

        res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving restaurants' });
    }
};

// @desc    Get single restaurant by ID including categories and active menu items
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: req.params.id },
            include: {
                categories: {
                    where: { visible: true },
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        menuItems: {
                            where: { inStock: true }
                        }
                    }
                }
            }
        });

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving restaurant' });
    }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private (RESTAURANT_OWNER)
exports.createRestaurant = async (req, res) => {
    try {
        // Add owner ID from the JWT token
        req.body.ownerId = req.user.id;

        // Optional arrays formatting
        if (req.body.cuisineTypes && typeof req.body.cuisineTypes === 'string') {
            req.body.cuisineTypes = req.body.cuisineTypes.split(',').map(c => c.trim());
        }

        const restaurant = await prisma.restaurant.create({
            data: req.body
        });

        res.status(201).json({ success: true, data: restaurant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error creating restaurant' });
    }
};

// @desc    Update restaurant details
// @route   PUT /api/restaurants/:id
// @access  Private (RESTAURANT_OWNER / Admin)
exports.updateRestaurant = async (req, res) => {
    try {
        let restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
        if (restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
        }
        // Whitelist only valid Restaurant schema fields to avoid Prisma errors
        const {
            name, businessType, description, address, city, area,
            logo, coverImage, openingTime, closingTime, status,
            delivery, dineIn, takeaway, deliveryFee, priceRange, cuisineTypes,
        } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (businessType !== undefined) updateData.businessType = businessType;
        if (description !== undefined) updateData.description = description;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (area !== undefined) updateData.area = area;
        if (logo !== undefined) updateData.logo = logo;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (openingTime !== undefined) updateData.openingTime = openingTime;
        if (closingTime !== undefined) updateData.closingTime = closingTime;
        if (status !== undefined) updateData.status = status;
        if (delivery !== undefined) updateData.delivery = delivery;
        if (dineIn !== undefined) updateData.dineIn = dineIn;
        if (takeaway !== undefined) updateData.takeaway = takeaway;
        if (deliveryFee !== undefined) updateData.deliveryFee = parseFloat(deliveryFee);
        if (priceRange !== undefined) updateData.priceRange = priceRange;
        if (cuisineTypes !== undefined) {
            updateData.cuisineTypes = typeof cuisineTypes === 'string'
                ? cuisineTypes.split(',').map(c => c.trim())
                : cuisineTypes;
        }
        restaurant = await prisma.restaurant.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating restaurant' });
    }
};

// @desc    Get logged-in owner's restaurants
// @route   GET /api/restaurants/mine
// @access  Private (RESTAURANT_OWNER)
exports.getMyRestaurants = async (req, res) => {
    try {
        // Find restaurants where user is owner or part of team
        const restaurants = await prisma.restaurant.findMany({
            where: {
                OR: [
                    { ownerId: req.user.id },
                    { teamMembers: { some: { userId: req.user.id } } }
                ]
            },
            include: {
                categories: true
            }
        });

        res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving your restaurants' });
    }
};
