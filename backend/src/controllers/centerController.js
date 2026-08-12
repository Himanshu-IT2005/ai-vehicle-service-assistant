const { pool } = require('../config/db');

// @desc    Get all service centers
// @route   GET /api/service-centers
// @access  Private
const getServiceCenters = async (req, res, next) => {
    const { city } = req.query;

    try {
        let query = 'SELECT * FROM service_centers';
        const params = [];

        if (city) {
            query += ' WHERE city = ?';
            params.push(city);
        }

        query += ' ORDER BY rating DESC';

        const [rows] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            message: "Service centers list retrieved successfully",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get service center details
// @route   GET /api/service-centers/:id
// @access  Private
const getServiceCenterById = async (req, res, next) => {
    const centerId = req.params.id;

    try {
        const [rows] = await pool.query('SELECT * FROM service_centers WHERE id = ?', [centerId]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service center not found.",
                error: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Service center details retrieved",
            data: rows[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new service center
// @route   POST /api/service-centers
// @access  Private/Admin
const createServiceCenter = async (req, res, next) => {
    const { name, address, city, phone, email, openingHours, services, rating } = req.body;

    try {
        if (!name || !address || !city || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please fill out name, address, city, and phone *.",
                error: null
            });
        }

        const [result] = await pool.query(
            `INSERT INTO service_centers 
        (name, address, city, phone, email, opening_hours, services, rating) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, address, city, phone, email || null, openingHours || null, services || null, rating || 0.00]
        );

        const [rows] = await pool.query('SELECT * FROM service_centers WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: "Service center created successfully",
            data: rows[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update service center details
// @route   PUT /api/service-centers/:id
// @access  Private/Admin
const updateServiceCenter = async (req, res, next) => {
    const centerId = req.params.id;
    const { name, address, city, phone, email, openingHours, services, rating } = req.body;

    try {
        const [existing] = await pool.query('SELECT id FROM service_centers WHERE id = ?', [centerId]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service center not found.",
                error: null
            });
        }

        if (!name || !address || !city || !phone) {
            return res.status(400).json({
                success: false,
                message: "Required parameters cannot be empty.",
                error: null
            });
        }

        await pool.query(
            `UPDATE service_centers SET 
        name = ?, address = ?, city = ?, phone = ?, email = ?, 
        opening_hours = ?, services = ?, rating = ? 
       WHERE id = ?`,
            [name, address, city, phone, email || null, openingHours || null, services || null, rating || 0.00, centerId]
        );

        const [updated] = await pool.query('SELECT * FROM service_centers WHERE id = ?', [centerId]);

        res.status(200).json({
            success: true,
            message: "Service center updated successfully",
            data: updated[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete service center
// @route   DELETE /api/service-centers/:id
// @access  Private/Admin
const deleteServiceCenter = async (req, res, next) => {
    const centerId = req.params.id;

    try {
        const [rows] = await pool.query('SELECT id FROM service_centers WHERE id = ?', [centerId]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service center not found.",
                error: null
            });
        }

        await pool.query('DELETE FROM service_centers WHERE id = ?', [centerId]);

        res.status(200).json({
            success: true,
            message: "Service center deleted successfully",
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getServiceCenters,
    getServiceCenterById,
    createServiceCenter,
    updateServiceCenter,
    deleteServiceCenter
};
