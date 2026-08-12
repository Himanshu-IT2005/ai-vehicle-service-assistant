const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_here');

            // Attach user credentials to req
            req.user = {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                role: decoded.role
            };

            return next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token verification failed.",
                error: null
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided.",
            error: null
        });
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - You do not have permissions to perform this action.",
                error: null
            });
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};
