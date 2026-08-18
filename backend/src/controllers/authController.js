const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide Name, Email, and Password values *.",
                error: null
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format.",
                error: null
            });
        }

        // Check if user already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email identity already registered.",
                error: null
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, passwordHash, phone || null, 'owner', 'active']
        );

        const userId = result.insertId;

        // Fetch newly created user
        const [users] = await pool.query('SELECT id, name, email, role, phone FROM users WHERE id = ?', [userId]);
        const user = users[0];

        const token = generateToken(user);

        // Send congratulations welcome email in background
        sendWelcomeEmail(email, name).catch(err => console.error(err));

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both Email and Password particulars.",
                error: null
            });
        }

        // Find user
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
                error: null
            });
        }

        const user = rows[0];

        // Check if suspended
        if (user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                message: "Accounts suspended. Please contact coordinator support.",
                error: null
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
                error: null
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Initiate password reset (forgot password)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter your registered email address.",
                error: null
            });
        }

        // Find user
        const [rows] = await pool.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            // Return success anyway to prevent username enumeration, but don't send emails
            return res.status(200).json({
                success: true,
                message: "If the email exists in our system, reset instructions have been dispatched."
            });
        }

        const user = rows[0];

        // Generate a random temporary password
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        let tempPassword = 'VS-';
        for (let i = 0; i < 8; i++) {
            tempPassword += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Hash the temporary password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        // Update database with the new password hash
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);

        // Send email with the temporary password asynchronously in background
        sendResetPasswordEmail(user.email, user.name, tempPassword).catch(mailErr => {
            console.error('\n=======================================================');
            console.log('[DEVELOPER MAIL FALLBACK] Send mail failed. Temporary Password:');
            console.log(`To: ${user.email}`);
            console.log(`Temp Password: ${tempPassword}`);
            console.log('=======================================================\n');
        });

        res.status(200).json({
            success: true,
            message: "Password reset instructions sent successfully."
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    forgotPassword
};
