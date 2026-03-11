const prisma = require('../config/db');

// @desc    Get team members for a restaurant
// @route   GET /api/restaurants/:restaurantId/team
// @access  Private (RESTAURANT_OWNER / MANAGER)
exports.getTeamMembers = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        // Verify access
        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

        const isAuthorized =
            restaurant.ownerId === req.user.id ||
            req.user.role === 'ADMIN' ||
            await prisma.teamMember.findFirst({ where: { restaurantId, userId: req.user.id, role: { in: ['OWNER', 'MANAGER'] } } });

        if (!isAuthorized) return res.status(403).json({ success: false, message: 'Not authorized' });

        const team = await prisma.teamMember.findMany({
            where: { restaurantId },
            include: {
                user: { select: { fullName: true, avatar: true, phone: true } }
            }
        });

        res.status(200).json({ success: true, count: team.length, data: team });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving team' });
    }
};

// @desc    Invite a team member
// @route   POST /api/restaurants/:restaurantId/team/invite
// @access  Private (RESTAURANT_OWNER / MANAGER)
exports.inviteTeamMember = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { email, name, role } = req.body;

        // Verify access
        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        const isAuthorized =
            restaurant.ownerId === req.user.id ||
            req.user.role === 'ADMIN' ||
            await prisma.teamMember.findFirst({ where: { restaurantId, userId: req.user.id, role: { in: ['OWNER', 'MANAGER'] } } });

        if (!isAuthorized) return res.status(403).json({ success: false, message: 'Not authorized' });

        // Check if user already in system
        const existingUser = await prisma.user.findUnique({ where: { email } });

        // Check if already invited
        const existingMember = await prisma.teamMember.findUnique({
            where: { restaurantId_email: { restaurantId, email } }
        });

        if (existingMember) {
            return res.status(400).json({ success: false, message: 'User is already invited or part of the team' });
        }

        const member = await prisma.teamMember.create({
            data: {
                restaurantId,
                email,
                name,
                role: role || 'STAFF',
                userId: existingUser ? existingUser.id : null,
                status: existingUser ? 'ACTIVE' : 'PENDING'
            }
        });

        // In a real app, send an email to `email` here

        res.status(201).json({ success: true, data: member, message: 'Invitation sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error inviting team member' });
    }
};

// @desc    Update team member status/role
// @route   PATCH /api/restaurants/:restaurantId/team/:id
// @access  Private (RESTAURANT_OWNER)
exports.updateTeamMember = async (req, res) => {
    try {
        const { status, role } = req.body;

        const member = await prisma.teamMember.findUnique({ where: { id: req.params.id }, include: { restaurant: true } });
        if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

        if (member.restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only owner can update roles/status' });
        }

        const updated = await prisma.teamMember.update({
            where: { id: req.params.id },
            data: { status, role }
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating team member' });
    }
};

// @desc    Remove team member
// @route   DELETE /api/restaurants/:restaurantId/team/:id
// @access  Private (RESTAURANT_OWNER)
exports.removeTeamMember = async (req, res) => {
    try {
        const member = await prisma.teamMember.findUnique({ where: { id: req.params.id }, include: { restaurant: true } });
        if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

        if (member.restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only owner can remove team members' });
        }

        await prisma.teamMember.delete({ where: { id: req.params.id } });

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error removing team member' });
    }
};
