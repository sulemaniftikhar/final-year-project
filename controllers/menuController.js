const prisma = require('../config/db');

// --- CATEGORIES ---

// @desc    Get all categories with menu items for a restaurant
// @route   GET /api/restaurants/:restaurantId/menu
// @access  Public
exports.getMenu = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: {
                restaurantId: req.params.restaurantId,
                visible: true
            },
            orderBy: { sortOrder: 'asc' },
            include: {
                menuItems: {
                    where: { inStock: true }
                }
            }
        });

        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving menu' });
    }
};

// @desc    Create category
// @route   POST /api/restaurants/:restaurantId/menu/categories
// @access  Private (RESTAURANT_OWNER)
exports.createCategory = async (req, res) => {
    try {
        // Verify ownership
        const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.restaurantId } });
        if (!restaurant || (restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { name, sortOrder, visible } = req.body;

        // Check if category name exists
        const existing = await prisma.category.findUnique({
            where: { restaurantId_name: { restaurantId: req.params.restaurantId, name } }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }

        const category = await prisma.category.create({
            data: {
                restaurantId: req.params.restaurantId,
                name,
                sortOrder: sortOrder || 0,
                visible: visible !== undefined ? visible : true
            }
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error creating category' });
    }
};


// --- MENU ITEMS ---

// @desc    Create menu item
// @route   POST /api/restaurants/:restaurantId/menu/items
// @access  Private (RESTAURANT_OWNER)
exports.createMenuItem = async (req, res) => {
    try {
        // Verify ownership
        const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.restaurantId } });
        if (!restaurant || (restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { name, description, price, categoryId, inStock, image } = req.body;

        if (!name || !categoryId || price === undefined) {
            return res.status(400).json({ success: false, message: 'name, categoryId, and price are required' });
        }

        const item = await prisma.menuItem.create({
            data: {
                restaurantId: req.params.restaurantId,
                categoryId,
                name,
                description: description || '',
                price: parseFloat(price),
                inStock: inStock !== undefined ? inStock : true,
                image: image || null,   // schema field name is 'image', not 'imageUrl'
            }
        });

        res.status(201).json({ success: true, data: item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error creating menu item' });
    }
};

// @desc    Update menu item
// @route   PUT /api/restaurants/:restaurantId/menu/items/:id
// @access  Private (RESTAURANT_OWNER)
exports.updateMenuItem = async (req, res) => {
    try {
        const item = await prisma.menuItem.findUnique({
            where: { id: req.params.id },
            include: { restaurant: true }
        });

        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        if (item.restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Whitelist valid fields only
        const { name, description, price, categoryId, inStock, image, badge } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (inStock !== undefined) updateData.inStock = inStock;
        if (image !== undefined) updateData.image = image;
        if (badge !== undefined) updateData.badge = badge;

        const updated = await prisma.menuItem.update({
            where: { id: req.params.id },
            data: updateData,
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating menu item' });
    }
};

// @desc    Toggle out of stock / in stock quickly
// @route   PATCH /api/restaurants/:restaurantId/menu/items/:id/stock
// @access  Private (RESTAURANT_OWNER)
exports.toggleStock = async (req, res) => {
    try {
        const item = await prisma.menuItem.findUnique({
            where: { id: req.params.id },
            include: { restaurant: true }
        });

        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        if (item.restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updated = await prisma.menuItem.update({
            where: { id: req.params.id },
            data: { inStock: !item.inStock }
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error toggling stock' });
    }
};
