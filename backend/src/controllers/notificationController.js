const { pool } = require('../config/db');

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markNotificationsRead = async (req, res, next) => {
    try {
        await pool.query(
            "UPDATE notifications SET status = 'read' WHERE user_id = ?",
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getNotifications,
    markNotificationsRead
};
