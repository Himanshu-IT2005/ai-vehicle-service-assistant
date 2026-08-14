const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorMiddleware');
require('dotenv').config();

const app = express();

// Trust reverse proxy (Railway uses a proxy to forward requests, needed for express-rate-limit)
app.set('trust proxy', 1);

// =========================================================================
// 1. SECURITY MIDDLEWARE
// =========================================================================
// Helmet headers protection
app.use(helmet());

// CORS configuration (allow requests from development localhost ports dynamically)
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        if (origin === clientUrl) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));

// Rate limiting on sensitive endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Limit each IP to 10000 requests per window (increased to prevent dev/refresh limits)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP identity. Please try again after 15 minutes.",
        error: null
    }
});
app.use('/api/', apiLimiter);

// Body Parser
app.use(express.json());

// =========================================================================
// 2. ROUTE MOUNTING
// =========================================================================
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const serviceRoutes = require('./routes/services');
const reminderRoutes = require('./routes/reminders');
const expenseRoutes = require('./routes/expenses');
const centerRoutes = require('./routes/centers');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/service-records', serviceRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/service-centers', centerRoutes);
app.use('/api/ai-analyses', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback Route
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Endpoint route not found on server.",
        error: null
    });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
