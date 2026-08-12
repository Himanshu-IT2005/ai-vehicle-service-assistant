const { pool } = require('../config/db');

// Helper to check ownership or admin bypass
const verifyVehicleAccess = async (vehicleId, userId, userRole) => {
    const [rows] = await pool.query('SELECT user_id FROM vehicles WHERE id = ?', [vehicleId]);
    if (rows.length === 0) return { exists: false };
    const vehicle = rows[0];
    const hasAccess = vehicle.user_id === userId || userRole === 'admin';
    return { exists: true, user_id: vehicle.user_id, hasAccess };
};

// @desc    Get all vehicles of authenticated user
// @route   GET /api/vehicles
// @access  Private
const getVehicles = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            message: "Vehicles list retrieved successfully",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res, next) => {
    const {
        brand, model, year, fuelType, currentMileage,
        registrationNumber, purchaseDate, lastServiceDate, lastServiceMileage
    } = req.body;

    try {
        if (!brand || !model || !year || !fuelType || !registrationNumber) {
            return res.status(400).json({
                success: false,
                message: "Please fill out Brand, Model, Year, Fuel Type, and Registration Number *.",
                error: null
            });
        }

        // Validation
        const currentYear = new Date().getFullYear();
        if (year < 1886 || year > currentYear + 1) {
            return res.status(400).json({
                success: false,
                message: `Year must be between 1886 and ${currentYear + 1}.`,
                error: null
            });
        }

        if (currentMileage < 0) {
            return res.status(400).json({
                success: false,
                message: "Mileage cannot be negative.",
                error: null
            });
        }

        // Check unique registration number
        const [existing] = await pool.query('SELECT id FROM vehicles WHERE registration_number = ?', [registrationNumber]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Registration plate number already exists in fleet.",
                error: null
            });
        }

        // Insert vehicle
        const [result] = await pool.query(
            `INSERT INTO vehicles 
        (user_id, brand, model, year, fuel_type, current_mileage, registration_number, purchase_date, last_service_date, last_service_mileage) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id, brand, model, year, fuelType, currentMileage || 0, registrationNumber,
                purchaseDate || null, lastServiceDate || null, lastServiceMileage || null
            ]
        );

        const vehicleId = result.insertId;
        const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: rows[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get single vehicle details
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = async (req, res, next) => {
    const vehicleId = req.params.id;

    try {
        const access = await verifyVehicleAccess(vehicleId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this vehicle data.",
                error: null
            });
        }

        const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

        res.status(200).json({
            success: true,
            message: "Vehicle details retrieved successfully",
            data: rows[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update vehicle particulars
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res, next) => {
    const vehicleId = req.params.id;
    const {
        brand, model, year, fuelType, currentMileage,
        registrationNumber, purchaseDate, lastServiceDate, lastServiceMileage
    } = req.body;

    try {
        const access = await verifyVehicleAccess(vehicleId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized change attempt on this vehicle particulars.",
                error: null
            });
        }

        if (!brand || !model || !year || !fuelType || !registrationNumber) {
            return res.status(400).json({
                success: false,
                message: "Please fill out Brand, Model, Year, Fuel Type, and Registration Number.",
                error: null
            });
        }

        // Check registration conflict
        const [existing] = await pool.query(
            'SELECT id FROM vehicles WHERE registration_number = ? AND id != ?',
            [registrationNumber, vehicleId]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Registration plate identifier is already in use by another unit.",
                error: null
            });
        }

        await pool.query(
            `UPDATE vehicles SET 
        brand = ?, model = ?, year = ?, fuel_type = ?, current_mileage = ?, 
        registration_number = ?, purchase_date = ?, last_service_date = ?, last_service_mileage = ?
       WHERE id = ?`,
            [
                brand, model, year, fuelType, currentMileage || 0, registrationNumber,
                purchaseDate || null, lastServiceDate || null, lastServiceMileage || null, vehicleId
            ]
        );

        const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: rows[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res, next) => {
    const vehicleId = req.params.id;

    try {
        const access = await verifyVehicleAccess(vehicleId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Vehicle registry not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized delete action on database vehicle.",
                error: null
            });
        }

        await pool.query('DELETE FROM vehicles WHERE id = ?', [vehicleId]);

        res.status(200).json({
            success: true,
            message: "Vehicle data removed successfully",
            data: {}
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get complete info summary for a vehicle (including health metric score)
// @route   GET /api/vehicles/:id/details
// @access  Private
const getVehicleDetails = async (req, res, next) => {
    const vehicleId = req.params.id;

    try {
        const access = await verifyVehicleAccess(vehicleId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized query.",
                error: null
            });
        }

        // Parallel fetch statements
        const [specRows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
        const [serviceRows] = await pool.query(
            `SELECT sr.*, sc.name AS category_name 
       FROM service_records sr 
       LEFT JOIN service_categories sc ON sr.category_id = sc.id 
       WHERE sr.vehicle_id = ? ORDER BY sr.service_date DESC`,
            [vehicleId]
        );
        const [reminderRows] = await pool.query(
            `SELECT mr.*, sc.name AS category_name 
       FROM maintenance_reminders mr 
       LEFT JOIN service_categories sc ON mr.category_id = sc.id 
       WHERE mr.vehicle_id = ? ORDER BY mr.due_date ASC`,
            [vehicleId]
        );
        const [expenseRows] = await pool.query(
            'SELECT * FROM expenses WHERE vehicle_id = ? ORDER BY date DESC',
            [vehicleId]
        );
        const [aiRows] = await pool.query(
            'SELECT * FROM ai_analyses WHERE vehicle_id = ? ORDER BY created_at DESC',
            [vehicleId]
        );

        const vehicle = specRows[0];

        // Calculate vehicle dynamic health score
        let healthScore = 100;

        // 1. Deduct 5 points per overdue reminder (or reminders with status pending and past due date)
        const todayStr = new Date().toISOString().split('T')[0];
        const overdueReminders = reminderRows.filter(r => r.status === 'pending' && r.due_date < todayStr);
        healthScore -= overdueReminders.length * 8;

        // 2. Deduct points if mileage difference since last service is too high
        if (vehicle.current_mileage && vehicle.last_service_mileage) {
            const diff = vehicle.current_mileage - vehicle.last_service_mileage;
            if (diff > 10000) {
                healthScore -= 15;
            } else if (diff > 5000) {
                healthScore -= 5;
            }
        }

        // 3. Deduct points if there is a 'High' severity AI diagnosis sessions in history
        const highAi = aiRows.filter(ai => ai.response_severity === 'High');
        healthScore -= highAi.length * 10;

        // Enforce lower bound
        if (healthScore < 30) healthScore = 30;

        const details = {
            ...vehicle,
            healthScore,
            serviceHistory: serviceRows,
            reminders: reminderRows,
            expenses: expenseRows,
            aiHistory: aiRows
        };

        res.status(200).json({
            success: true,
            message: "Complete vehicle metadata assembled successfully",
            data: details
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getVehicles,
    createVehicle,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    getVehicleDetails
};
