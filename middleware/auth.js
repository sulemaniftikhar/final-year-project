const { admin, isInitialized } = require('../config/firebase');
const prisma = require('../config/db');

/**
 * Protect middleware
 * Verifies the Firebase ID token in the Authorization header.
 * If valid, fetches the user from PostgreSQL and attaches `req.user`.
 */
exports.protect = async (req, res, next) => {
    try {
        if (!isInitialized) {
            return res.status(500).json({ success: false, message: 'Firebase Admin not configured on server' });
        }

        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
        }

        // Verify token using Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Find the user in our PostgreSQL database using the Firebase UID
        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found in database' });
        }

        // Attach user to request object
        req.user = user;

        // Also attach the raw firebase token payload if needed
        req.firebaseUser = decodedToken;

        next();
    } catch (error) {
        console.error('Auth protect error details:', {
            message: error.message,
            code: error.code,
            isInitialized,
            hasToken: !!req.headers.authorization
        });
        return res.status(401).json({ success: false, message: 'Not authorized, token failed', detail: error.message });
    }
};

/**
 * Authorize middleware
 * Grants access to specific roles only.
 * Must be used AFTER protect middleware.
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user?.role}' is not authorized to access this route`
            });
        }
        next();
    };
};
