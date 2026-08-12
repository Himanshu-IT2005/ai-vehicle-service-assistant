const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?', [req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User Profile not found.",
                error: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: rows[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    const { name, phone } = req.body;

    try {
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is a required field.",
                error: null
            });
        }

        await pool.query(
            'UPDATE users SET name = ?, phone = ? WHERE id = ?',
            [name, phone || null, req.user.id]
        );

        const [rows] = await pool.query('SELECT id, name, email, phone, role, status FROM users WHERE id = ?', [req.user.id]);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: rows[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    try {
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please enter both oldPassword and newPassword parameters.",
                error: null
            });
        }

        // Get current user password_hash
        const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
                error: null
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect old password details.",
                error: null
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, req.user.id]);

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword
};
