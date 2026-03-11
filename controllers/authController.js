const prisma = require('../config/db');

/**
 * Helper to generate a personalized referral code (e.g., WALEED782)
 */
const generateUniqueReferralCode = async (fullName) => {
    const firstName = fullName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    let code;
    let isUnique = false;

    while (!isUnique) {
        const randomNum = Math.floor(100 + Math.random() * 900);
        code = `${firstName}${randomNum}`;

        const existing = await prisma.user.findUnique({
            where: { referralCode: code }
        });

        if (!existing) isUnique = true;
    }
    return code;
};

/**
 * @desc    Register user in Postgres after Firebase signup
 * @route   POST /api/auth/register
 * @access  Public (But requires a valid Firebase ID Token in body or header)
 */
exports.register = async (req, res) => {
    try {
        const { firebaseUid, email, fullName, phone, role, referralCode: usedReferralCode } = req.body;

        if (!firebaseUid || !email || !fullName) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { firebaseUid }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const referralCode = await generateUniqueReferralCode(fullName);

        // Handle referral logic
        let referrer = null;
        let pointsToAward = 0;

        if (usedReferralCode) {
            referrer = await prisma.user.findUnique({
                where: { referralCode: usedReferralCode }
            });

            if (referrer) {
                pointsToAward = 100; // Reward for the new user
            }
        }

        // Create user in PostgreSQL
        const user = await prisma.user.create({
            data: {
                firebaseUid,
                email,
                fullName,
                phone,
                role: role || 'CUSTOMER',
                referralCode,
                rewardPoints: pointsToAward
            }
        });

        // Award points to referrer and create reward records
        if (referrer) {
            // Update referrer's points
            await prisma.user.update({
                where: { id: referrer.id },
                data: { rewardPoints: { increment: 100 } }
            });

            // Create reward record for referrer
            await prisma.reward.create({
                data: {
                    userId: referrer.id,
                    points: 100,
                    type: 'EARNED',
                    source: 'Referral',
                    description: `Referral reward for inviting ${user.fullName}`
                }
            });

            // Create reward record for new user
            await prisma.reward.create({
                data: {
                    userId: user.id,
                    points: 100,
                    type: 'EARNED',
                    source: 'Referral',
                    description: `Welcome bonus for using referral code: ${usedReferralCode}`
                }
            });
        }

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        // req.user is populated by the protect middleware
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                addresses: true // Include addresses if customer
            }
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
