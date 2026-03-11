const prisma = require('../config/db');

// Helper to generate order numbers
const generateOrderNumber = () => {
    return `#ORD-${Math.floor(100000 + Math.random() * 900000)}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (CUSTOMER)
exports.createOrder = async (req, res) => {
    try {
        const {
            restaurantId, type, table, items, subtotal,
            deliveryFee, taxes, platformFee, total,
            deliveryAddress, customerNotes, paymentMethod
        } = req.body;

        // Validate restaurant
        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Map items to format expected by Prisma nested write
        const orderItemsData = items.map(item => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            modifiers: item.modifiers || null
        }));

        const order = await prisma.order.create({
            data: {
                orderNumber: generateOrderNumber(),
                restaurantId,
                customerId: req.user.id,
                type,
                table: type === 'DINEIN' ? table : null,
                subtotal,
                deliveryFee: deliveryFee || 0,
                taxes: taxes || 0,
                platformFee: platformFee || 0,
                total,
                deliveryAddress: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
                customerNotes,
                paymentMethod: paymentMethod || 'CASH',
                items: {
                    create: orderItemsData
                }
            },
            include: {
                items: true,
                restaurant: {
                    select: { name: true, logo: true }
                }
            }
        });

        // Refetch with customer info for socket emit
        const orderWithCustomer = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                items: true,
                restaurant: { select: { name: true, logo: true } },
                customer: { select: { fullName: true, phone: true } }
            }
        });

        // --- Socket.IO Real-time Emit ---
        const io = req.app.get('io');
        if (io) {
            io.to(`restaurant_${restaurantId}`).emit('newOrder', orderWithCustomer);
        }

        res.status(201).json({ success: true, data: orderWithCustomer });
    } catch (error) {
        console.error("ORDER CREATION ERROR:", error);
        res.status(500).json({ success: false, message: error.message || 'Server error creating order', errorDetails: error });
    }
};

// @desc    Get user's orders (Customer gets their own, Restaurant gets theirs)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        let whereClause = {};

        if (req.user.role === 'CUSTOMER') {
            whereClause.customerId = req.user.id;
        } else if (req.user.role === 'RESTAURANT_OWNER') {
            // A restaurant owner might own multiple restaurants, or we pass a query param
            const { restaurantId } = req.query;

            const ownerRestaurants = await prisma.restaurant.findMany({
                where: { ownerId: req.user.id },
                select: { id: true }
            });
            const ownerRestIds = ownerRestaurants.map(r => r.id);

            whereClause.restaurantId = restaurantId ? restaurantId : { in: ownerRestIds };
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
                restaurant: {
                    select: { name: true, logo: true, address: true }
                },
                customer: {
                    select: { fullName: true, phone: true }
                }
            }
        });

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving orders' });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (RESTAURANT_OWNER)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, prepTime } = req.body;

        // Find order to check ownership
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: { restaurant: true }
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedData = { status };
        if (prepTime && status === 'ACCEPTED') {
            updatedData.prepTime = parseInt(prepTime);

            // Calculate estimated delivery time based on prep time + 15 mins for delivery approx
            const estTime = new Date();
            estTime.setMinutes(estTime.getMinutes() + updatedData.prepTime + (order.type === 'DELIVERY' ? 15 : 0));
            updatedData.estimatedDeliveryTime = estTime;
        }

        const updatedOrder = await prisma.order.update({
            where: { id: req.params.id },
            data: updatedData,
            include: {
                customer: { select: { id: true, fullName: true, phone: true } },
                restaurant: { select: { id: true, name: true } },
                items: true
            }
        });

        // --- Socket.IO Real-time Emit ---
        const io = req.app.get('io');
        if (io) {
            // Notify customer specific order room
            io.to(`order_${order.id}`).emit('orderStatusUpdate', updatedOrder);
            // Notify restaurant room
            io.to(`restaurant_${order.restaurantId}`).emit('orderStatusUpdate', updatedOrder);
        }

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating order status' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                restaurant: true,
                customer: { select: { id: true, fullName: true, phone: true } },
                items: { include: { menuItem: true } }
            }
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Check if user has permission to view
        const isCustomer = order.customerId === req.user.id;
        const isOwnerOrAdmin = await prisma.restaurant.findUnique({ where: { id: order.restaurantId } })
            .then(r => r?.ownerId === req.user.id || req.user.role === 'ADMIN');

        if (!isCustomer && !isOwnerOrAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching order' });
    }
};
