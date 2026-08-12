const { pool } = require('../config/db');

// Helper: Verify if vehicle belongs to current user
const verifyVehicleOwnership = async (vehicleId, userId) => {
    const [rows] = await pool.query('SELECT user_id FROM vehicles WHERE id = ?', [vehicleId]);
    return rows.length > 0 && rows[0].user_id === userId;
};

// Helper verifying reminder ownership
const verifyReminderOwnership = async (reminderId, userId, userRole) => {
    const [rows] = await pool.query(
        `SELECT mr.*, v.user_id 
     FROM maintenance_reminders mr 
     INNER JOIN vehicles v ON mr.vehicle_id = v.id 
     WHERE mr.id = ?`,
        [reminderId]
    );
    if (rows.length === 0) return { exists: false };
    const hasAccess = rows[0].user_id === userId || userRole === 'admin';
    return { exists: true, data: rows[0], hasAccess };
};

// @desc    Get all reminders for current user's vehicles + auto overdue check
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res, next) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Auto-update overdue reminders from pending to overdue where due_date < today
        await pool.query(
            `UPDATE maintenance_reminders mr
       INNER JOIN vehicles v ON mr.vehicle_id = v.id
       SET mr.status = 'overdue'
       WHERE v.user_id = ? AND mr.status = 'pending' AND mr.due_date < ?`,
            [req.user.id, todayStr]
        );

        // 2. Fetch updated reminders
        const [rows] = await pool.query(
            `SELECT mr.*, sc.name AS category_name, v.brand, v.model, v.registration_number
       FROM maintenance_reminders mr
       INNER JOIN vehicles v ON mr.vehicle_id = v.id
       LEFT JOIN service_categories sc ON mr.category_id = sc.id
       WHERE v.user_id = ?
       ORDER BY mr.due_date ASC`,
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            message: "Reminders list retrieved successfully",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new reminder schedule
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res, next) => {
    const { vehicleId, categoryId, title, description, dueDate, dueMileage } = req.body;

    try {
        if (!vehicleId || !categoryId || !title || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Please fill out vehicleId, categoryId, title, and dueDate *.",
                error: null
            });
        }

        const isOwner = await verifyVehicleOwnership(vehicleId, req.user.id);
        if (!isOwner) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized - Vehicle does not belong to your garage.",
                error: null
            });
        }

        // Insert reminder
        const todayStr = new Date().toISOString().split('T')[0];
        const initialStatus = dueDate < todayStr ? 'overdue' : 'pending';

        const [result] = await pool.query(
            `INSERT INTO maintenance_reminders 
        (vehicle_id, category_id, title, description, due_date, due_mileage, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [vehicleId, categoryId, title, description || null, dueDate, dueMileage || null, initialStatus]
        );

        const [rows] = await pool.query(
            `SELECT mr.*, sc.name AS category_name 
       FROM maintenance_reminders mr 
       LEFT JOIN service_categories sc ON mr.category_id = sc.id 
       WHERE mr.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Reminder created successfully",
            data: rows[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get reminder details
// @route   GET /api/reminders/:id
// @access  Private
const getReminderById = async (req, res, next) => {
    const reminderId = req.params.id;

    try {
        const access = await verifyReminderOwnership(reminderId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Reminder not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this alarm.",
                error: null
            });
        }

        const [rows] = await pool.query(
            `SELECT mr.*, sc.name AS category_name, v.brand, v.model, v.registration_number
       FROM maintenance_reminders mr
       INNER JOIN vehicles v ON mr.vehicle_id = v.id
       LEFT JOIN service_categories sc ON mr.category_id = sc.id
       WHERE mr.id = ?`,
            [reminderId]
        );

        res.status(200).json({
            success: true,
            message: "Reminder details retrieved",
            data: rows[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Update reminder config
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res, next) => {
    const reminderId = req.params.id;
    const { categoryId, title, description, dueDate, dueMileage, status } = req.body;

    try {
        const access = await verifyReminderOwnership(reminderId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Reminder details not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized update on this alarm.",
                error: null
            });
        }

        if (!categoryId || !title || !dueDate || !status) {
            return res.status(400).json({
                success: false,
                message: "Required parameters are incomplete.",
                error: null
            });
        }

        await pool.query(
            `UPDATE maintenance_reminders SET 
        category_id = ?, title = ?, description = ?, due_date = ?, due_mileage = ?, status = ? 
       WHERE id = ?`,
            [categoryId, title, description || null, dueDate, dueMileage || null, status, reminderId]
        );

        const [updated] = await pool.query('SELECT * FROM maintenance_reminders WHERE id = ?', [reminderId]);

        res.status(200).json({
            success: true,
            message: "Reminder updated successfully",
            data: updated[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Patch command toggling status to completed
// @route   PATCH /api/reminders/:id/complete
// @access  Private
const patchReminderComplete = async (req, res, next) => {
    const reminderId = req.params.id;
    const { status } = req.body; // Expecting 'completed' or 'pending'

    try {
        const access = await verifyReminderOwnership(reminderId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Reminder not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized status toggle.",
                error: null
            });
        }

        const targetStatus = status || 'completed';

        await pool.query(
            'UPDATE maintenance_reminders SET status = ? WHERE id = ?',
            [targetStatus, reminderId]
        );

        const [updated] = await pool.query('SELECT * FROM maintenance_reminders WHERE id = ?', [reminderId]);

        res.status(200).json({
            success: true,
            message: `Reminder status adjusted to ${targetStatus} successfully`,
            data: updated[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res, next) => {
    const reminderId = req.params.id;

    try {
        const access = await verifyReminderOwnership(reminderId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Reminder not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized deletion command.",
                error: null
            });
        }

        await pool.query('DELETE FROM maintenance_reminders WHERE id = ?', [reminderId]);

        res.status(200).json({
            success: true,
            message: "Reminder deleted successfully",
            data: {}
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getReminders,
    createReminder,
    getReminderById,
    updateReminder,
    patchReminderComplete,
    deleteReminder
};
