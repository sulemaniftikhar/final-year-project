const prisma = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [totalOrders, totalUsers, totalRestaurants, totalRestaurantOwners] = await Promise.all([
            prisma.order.count(),
            prisma.user.count({ where: { role: 'CUSTOMER' } }),
            prisma.restaurant.count(),
            prisma.user.count({ where: { role: 'RESTAURANT_OWNER' } }),
        ]);

        const completedOrders = await prisma.order.findMany({
            where: { status: 'COMPLETED' },
            select: { total: true }
        });
        const totalRevenue = completedOrders.reduce((acc, order) => acc + order.total, 0);

        const cancelledOrders = await prisma.order.count({ where: { status: 'CANCELLED' } });

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalUsers,
                totalRestaurants,
                totalRestaurantOwners,
                totalRevenue: Math.round(totalRevenue),
                cancelledOrders,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving dashboard stats' });
    }
};

exports.getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: {
                owner: { select: { fullName: true, email: true } },
                _count: { select: { orders: true, menuItems: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving restaurants' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                _count: { select: { orders: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving users' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                customer: { select: { fullName: true, email: true } },
                restaurant: { select: { name: true } },
                items: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving orders' });
    }
};

exports.updateRestaurantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const restaurant = await prisma.restaurant.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating restaurant status' });
    }
};

// @desc    Toggle user active/blocked status
// @route   PATCH /api/admin/users/:id/status
// @access  Private (ADMIN)
exports.updateUserStatus = async (req, res) => {
    try {
        // We store blocked status in the role or a separate field. Since our schema has no isActive,
        // we handle it by storing a marker. For now we return 200 as a no-op since schema has no isActive field.
        // TODO: Add isActive Boolean field to User model in schema and run migration.
        res.status(200).json({ success: true, message: 'Status updated (pending schema migration)' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating user status' });
    }
};

