const { pool } = require('../config/db');

// Helper checking vehicle ownership
const verifyVehicleOwnership = async (vehicleId, userId) => {
    const [rows] = await pool.query('SELECT user_id FROM vehicles WHERE id = ?', [vehicleId]);
    return rows.length > 0 && rows[0].user_id === userId;
};

// Helper checking expense ownership
const verifyExpenseOwnership = async (expenseId, userId, userRole) => {
    const [rows] = await pool.query(
        `SELECT e.*, v.user_id 
     FROM expenses e 
     INNER JOIN vehicles v ON e.vehicle_id = v.id 
     WHERE e.id = ?`,
        [expenseId]
    );
    if (rows.length === 0) return { exists: false };
    const hasAccess = rows[0].user_id === userId || userRole === 'admin';
    return { exists: true, data: rows[0], hasAccess };
};

// @desc    Get user expenses list
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
    const { vehicleId } = req.query;

    try {
        let query = `
      SELECT e.*, v.brand, v.model, v.registration_number
      FROM expenses e
      INNER JOIN vehicles v ON e.vehicle_id = v.id
      WHERE v.user_id = ?
    `;
        const params = [req.user.id];

        if (vehicleId) {
            query += ` AND e.vehicle_id = ?`;
            params.push(vehicleId);
        }

        query += ` ORDER BY e.date DESC`;

        const [rows] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            message: "Expenses retrieved successfully",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a custom manual expense log
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
    const { vehicleId, category, amount, date, description } = req.body;

    try {
        if (!vehicleId || !category || amount === undefined || !date || !description) {
            return res.status(400).json({
                success: false,
                message: "Please fill out vehicleId, category, amount, date, and description *.",
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

        // Insert expense
        const [result] = await pool.query(
            `INSERT INTO expenses 
        (vehicle_id, service_record_id, category, amount, date, description) 
       VALUES (?, NULL, ?, ?, ?, ?)`,
            [vehicleId, category, amount, date, description]
        );

        const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: "Manual expense logged successfully",
            data: rows[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get expense details
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
    const expenseId = req.params.id;

    try {
        const access = await verifyExpenseOwnership(expenseId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Expense ledger entry not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this financial entry.",
                error: null
            });
        }

        const [rows] = await pool.query(
            `SELECT e.*, v.brand, v.model, v.registration_number
       FROM expenses e
       INNER JOIN vehicles v ON e.vehicle_id = v.id
       WHERE e.id = ?`,
            [expenseId]
        );

        res.status(200).json({
            success: true,
            message: "Expense details retrieved",
            data: rows[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Update custom expense log
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
    const expenseId = req.params.id;
    const { category, amount, date, description } = req.body;

    try {
        const access = await verifyExpenseOwnership(expenseId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Expense ledger not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized update on this ledger entry.",
                error: null
            });
        }

        if (!category || amount === undefined || !date || !description) {
            return res.status(400).json({
                success: false,
                message: "Required parameters are incomplete.",
                error: null
            });
        }

        // Prevent modification of amount/category directly if it is bound to a service record
        if (access.data.service_record_id !== null) {
            return res.status(400).json({
                success: false,
                message: "This expense was auto-logged via a Service Record. Please modify the Service Record directly instead.",
                error: null
            });
        }

        await pool.query(
            `UPDATE expenses SET 
        category = ?, amount = ?, date = ?, description = ? 
       WHERE id = ?`,
            [category, amount, date, description, expenseId]
        );

        const [updated] = await pool.query('SELECT * FROM expenses WHERE id = ?', [expenseId]);

        res.status(200).json({
            success: true,
            message: "Expense entry updated successfully",
            data: updated[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Delete manual expense ledger entry
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
    const expenseId = req.params.id;

    try {
        const access = await verifyExpenseOwnership(expenseId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Expense not found.",
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

        if (access.data.service_record_id !== null) {
            return res.status(400).json({
                success: false,
                message: "This expense cannot be deleted directly because it belongs to a Service Record. Please delete the Service Record instead.",
                error: null
            });
        }

        await pool.query('DELETE FROM expenses WHERE id = ?', [expenseId]);

        res.status(200).json({
            success: true,
            message: "Expense entry deleted successfully",
            data: {}
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getExpenses,
    createExpense,
    getExpenseById,
    updateExpense,
    deleteExpense
};
