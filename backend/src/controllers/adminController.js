const { pool } = require('../config/db');

// @desc    Get administrative analytics summary
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboardStats = async (req, res, next) => {
    try {
        const [usersCount] = await pool.query('SELECT COUNT(*) AS total FROM users');
        const [vehiclesCount] = await pool.query('SELECT COUNT(*) AS total FROM vehicles');
        const [recordsCount] = await pool.query('SELECT COUNT(*) AS total FROM service_records');
        const [aiCount] = await pool.query('SELECT COUNT(*) AS total FROM ai_analyses');
        const [expensesCount] = await pool.query('SELECT SUM(amount) AS total FROM expenses');

        res.status(200).json({
            success: true,
            message: "Admin statistics summary aggregated successfully",
            data: {
                totalUsers: usersCount[0].total,
                totalVehicles: vehiclesCount[0].total,
                totalServiceRecords: recordsCount[0].total,
                totalAiAnalyses: aiCount[0].total,
                totalExpenses: parseFloat(expensesCount[0].total || 0).toFixed(2)
            }
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get system users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, name, email, phone, role, status, created_at 
       FROM users ORDER BY created_at DESC`
        );

        res.status(200).json({
            success: true,
            message: "Users list retrieved",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get user detail
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getAdminUserById = async (req, res, next) => {
    const userId = req.params.id;

    try {
        const [userRows] = await pool.query(
            `SELECT id, name, email, phone, role, status, created_at 
       FROM users WHERE id = ?`,
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
                error: null
            });
        }

        const [vehicleRows] = await pool.query('SELECT * FROM vehicles WHERE user_id = ?', [userId]);

        res.status(200).json({
            success: true,
            message: "User audit details loaded",
            data: {
                profile: userRows[0],
                vehicles: vehicleRows
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user credentials role/status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateAdminUser = async (req, res, next) => {
    const userId = req.params.id;
    const { role, status } = req.body;

    try {
        const [userRows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
                error: null
            });
        }

        if (!role || !status) {
            return res.status(400).json({
                success: false,
                message: "Role and Status must be provided.",
                error: null
            });
        }

        // Prevent administrative self-suspension or demotion
        if (parseInt(userId) === req.user.id && (status === 'suspended' || role !== 'admin')) {
            return res.status(400).json({
                success: false,
                message: "Administrators cannot lock or demote their own profiles.",
                error: null
            });
        }

        await pool.query(
            'UPDATE users SET role = ?, status = ? WHERE id = ?',
            [role, status, userId]
        );

        const [updated] = await pool.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [userId]);

        res.status(200).json({
            success: true,
            message: "User profile updated successfully by admin",
            data: updated[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteAdminUser = async (req, res, next) => {
    const userId = req.params.id;

    try {
        const [userRows] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User profile not found.",
                error: null
            });
        }

        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "Administrators cannot delete their own profile records.",
                error: null
            });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [userId]);

        res.status(200).json({
            success: true,
            message: "User removed from system database",
            data: {}
        });

    } catch (err) {
        next(err);
    }
};

// @desc    List all vehicles registered across the system
// @route   GET /api/admin/vehicles
// @access  Private/Admin
const getAdminVehicles = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT v.*, u.name AS owner_name, u.email AS owner_email 
       FROM vehicles v
       INNER JOIN users u ON v.user_id = u.id
       ORDER BY v.created_at DESC`
        );

        res.status(200).json({
            success: true,
            message: "Fleet register load complete",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single vehicle details via Admin
// @route   GET /api/admin/vehicles/:id
// @access  Private/Admin
const getAdminVehicleById = async (req, res, next) => {
    const vehicleId = req.params.id;

    try {
        const [rows] = await pool.query(
            `SELECT v.*, u.name AS owner_name, u.email AS owner_email 
       FROM vehicles v
       INNER JOIN users u ON v.user_id = u.id
       WHERE v.id = ?`,
            [vehicleId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found in registry.",
                error: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle retrieved",
            data: rows[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    List all service records in system
// @route   GET /api/admin/service-records
// @access  Private/Admin
const getAdminServiceRecords = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT sr.*, sc.name AS category_name, v.brand, v.model, v.registration_number, u.name AS owner_name
       FROM service_records sr
       INNER JOIN vehicles v ON sr.vehicle_id = v.id 
       INNER JOIN users u ON v.user_id = u.id
       LEFT JOIN service_categories sc ON sr.category_id = sc.id 
       ORDER BY sr.service_date DESC`
        );

        res.status(200).json({
            success: true,
            message: "Global service records loaded",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    List all AI diagnoses sessions
// @route   GET /api/admin/ai-analyses
// @access  Private/Admin
const getAdminAiAnalyses = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT ai.*, u.name AS owner_name, v.brand, v.model, v.registration_number 
       FROM ai_analyses ai
       INNER JOIN users u ON ai.user_id = u.id
       LEFT JOIN vehicles v ON ai.vehicle_id = v.id 
       ORDER BY ai.created_at DESC`
        );

        res.status(200).json({
            success: true,
            message: "Global AI diagnostics log loaded",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAdminDashboardStats,
    getAdminUsers,
    getAdminUserById,
    updateAdminUser,
    deleteAdminUser,
    getAdminVehicles,
    getAdminVehicleById,
    getAdminServiceRecords,
    getAdminAiAnalyses
};
