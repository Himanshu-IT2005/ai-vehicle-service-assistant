const { pool } = require('../config/db');

// @desc    Get all service categories
// @route   GET /api/service-categories
// @access  Private
const getServiceCategories = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM service_categories ORDER BY name ASC');
        res.status(200).json({
            success: true,
            message: "Categories list retrieved successfully",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create service category
// @route   POST /api/service-categories
// @access  Private/Admin
const createServiceCategory = async (req, res, next) => {
    const { name, description } = req.body;

    try {
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category Name is a required field *.",
                error: null
            });
        }

        const [existing] = await pool.query('SELECT id FROM service_categories WHERE name = ?', [name]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Category name already exists.",
                error: null
            });
        }

        const [result] = await pool.query(
            'INSERT INTO service_categories (name, description) VALUES (?, ?)',
            [name, description || null]
        );

        const [rows] = await pool.query('SELECT * FROM service_categories WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: "Service category created successfully",
            data: rows[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update service category
// @route   PUT /api/service-categories/:id
// @access  Private/Admin
const updateServiceCategory = async (req, res, next) => {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    try {
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category Name must be provided.",
                error: null
            });
        }

        const [existing] = await pool.query(
            'SELECT id FROM service_categories WHERE name = ? AND id != ?',
            [name, categoryId]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Category name already exists on another category.",
                error: null
            });
        }

        const [rows] = await pool.query('SELECT id FROM service_categories WHERE id = ?', [categoryId]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service category not found.",
                error: null
            });
        }

        await pool.query(
            'UPDATE service_categories SET name = ?, description = ? WHERE id = ?',
            [name, description || null, categoryId]
        );

        const [updated] = await pool.query('SELECT * FROM service_categories WHERE id = ?', [categoryId]);

        res.status(200).json({
            success: true,
            message: "Service category updated successfully",
            data: updated[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete service category
// @route   DELETE /api/service-categories/:id
// @access  Private/Admin
const deleteServiceCategory = async (req, res, next) => {
    const categoryId = req.params.id;

    try {
        const [rows] = await pool.query('SELECT id FROM service_categories WHERE id = ?', [categoryId]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service category not found.",
                error: null
            });
        }

        // Check if any service records reference it
        const [records] = await pool.query('SELECT id FROM service_records WHERE category_id = ? LIMIT 1', [categoryId]);
        if (records.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category while active service records reference it.",
                error: null
            });
        }

        await pool.query('DELETE FROM service_categories WHERE id = ?', [categoryId]);

        res.status(200).json({
            success: true,
            message: "Service category removed successfully",
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// Helper: Verify if vehicle belongs to current user
const verifyVehicleOwnership = async (vehicleId, userId) => {
    const [rows] = await pool.query('SELECT user_id FROM vehicles WHERE id = ?', [vehicleId]);
    return rows.length > 0 && rows[0].user_id === userId;
};

// Helper: Verify record ownership
const verifyRecordOwnership = async (recordId, userId, userRole) => {
    const [rows] = await pool.query(
        `SELECT sr.*, v.user_id 
     FROM service_records sr 
     INNER JOIN vehicles v ON sr.vehicle_id = v.id 
     WHERE sr.id = ?`,
        [recordId]
    );
    if (rows.length === 0) return { exists: false };
    const hasAccess = rows[0].user_id === userId || userRole === 'admin';
    return { exists: true, data: rows[0], hasAccess };
};

// @desc    Get all service records belonging to user vehicles
// @route   GET /api/service-records
// @access  Private
const getServiceRecords = async (req, res, next) => {
    const { vehicleId } = req.query;

    try {
        let query = `
      SELECT sr.*, sc.name AS category_name, v.brand, v.model, v.registration_number
      FROM service_records sr
      INNER JOIN vehicles v ON sr.vehicle_id = v.id 
      LEFT JOIN service_categories sc ON sr.category_id = sc.id 
      WHERE v.user_id = ?
    `;
        const params = [req.user.id];

        if (vehicleId) {
            query += ` AND sr.vehicle_id = ?`;
            params.push(vehicleId);
        }

        query += ` ORDER BY sr.service_date DESC`;

        const [rows] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            message: "Service records retrieved successfully",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new service record & automatically append an expense
// @route   POST /api/service-records
// @access  Private
const createServiceRecord = async (req, res, next) => {
    const {
        vehicleId, categoryId, serviceDate, mileage,
        serviceCenter, cost, description, notes
    } = req.body;

    try {
        if (!vehicleId || !categoryId || !serviceDate || !mileage || !serviceCenter || cost === undefined || !description) {
            return res.status(400).json({
                success: false,
                message: "Please fill out vehicleId, categoryId, serviceDate, mileage, serviceCenter, cost, and description *.",
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

        // Check category exists
        const [cats] = await pool.query('SELECT id FROM service_categories WHERE id = ?', [categoryId]);
        if (cats.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service category not found.",
                error: null
            });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insert service record
            const [srResult] = await connection.query(
                `INSERT INTO service_records 
          (vehicle_id, category_id, service_date, mileage, service_center, cost, description, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [vehicleId, categoryId, serviceDate, mileage, serviceCenter, cost, description, notes || null]
            );
            const serviceRecordId = srResult.insertId;

            // 2. Automatical insert into expenses
            await connection.query(
                `INSERT INTO expenses 
          (vehicle_id, service_record_id, category, amount, date, description) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [vehicleId, serviceRecordId, 'service', cost, serviceDate, `Service Log: ${description}`]
            );

            // 3. Update vehicle registration current_mileage, last_service_date, last_service_mileage if current is newer or larger
            const [vehicleRows] = await connection.query('SELECT current_mileage, last_service_date FROM vehicles WHERE id = ?', [vehicleId]);
            const currentVeh = vehicleRows[0];

            let updateFields = [];
            let updateValues = [];

            if (!currentVeh.current_mileage || mileage > currentVeh.current_mileage) {
                updateFields.push('current_mileage = ?');
                updateValues.push(mileage);
            }

            if (!currentVeh.last_service_date || serviceDate >= currentVeh.last_service_date) {
                updateFields.push('last_service_date = ?');
                updateFields.push('last_service_mileage = ?');
                updateValues.push(serviceDate);
                updateValues.push(mileage);
            }

            if (updateFields.length > 0) {
                updateValues.push(vehicleId);
                await connection.query(
                    `UPDATE vehicles SET ${updateFields.join(', ')} WHERE id = ?`,
                    updateValues
                );
            }

            await connection.commit();

            const [records] = await pool.query(
                `SELECT sr.*, sc.name AS category_name 
         FROM service_records sr 
         LEFT JOIN service_categories sc ON sr.category_id = sc.id 
         WHERE sr.id = ?`,
                [serviceRecordId]
            );

            res.status(201).json({
                success: true,
                message: "Service record logged successfully, expense registered automatically",
                data: records[0]
            });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        next(err);
    }
};

// @desc    Get service record details
// @route   GET /api/service-records/:id
// @access  Private
const getServiceRecordById = async (req, res, next) => {
    const recordId = req.params.id;

    try {
        const access = await verifyRecordOwnership(recordId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Service record not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this service journal entry.",
                error: null
            });
        }

        const [rows] = await pool.query(
            `SELECT sr.*, sc.name AS category_name, v.brand, v.model, v.registration_number
       FROM service_records sr 
       INNER JOIN vehicles v ON sr.vehicle_id = v.id 
       LEFT JOIN service_categories sc ON sr.category_id = sc.id 
       WHERE sr.id = ?`,
            [recordId]
        );

        res.status(200).json({
            success: true,
            message: "Service record details retrieved",
            data: rows[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Update service record
// @route   PUT /api/service-records/:id
// @access  Private
const updateServiceRecord = async (req, res, next) => {
    const recordId = req.params.id;
    const {
        categoryId, serviceDate, mileage,
        serviceCenter, cost, description, notes
    } = req.body;

    try {
        const access = await verifyRecordOwnership(recordId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Service record not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized update on this service record.",
                error: null
            });
        }

        if (!categoryId || !serviceDate || !mileage || !serviceCenter || cost === undefined || !description) {
            return res.status(400).json({
                success: false,
                message: "Required fields cannot be empty.",
                error: null
            });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Update service record
            await connection.query(
                `UPDATE service_records SET 
          category_id = ?, service_date = ?, mileage = ?, 
          service_center = ?, cost = ?, description = ?, notes = ? 
         WHERE id = ?`,
                [categoryId, serviceDate, mileage, serviceCenter, cost, description, notes || null, recordId]
            );

            // 2. Synchronize price/description/date with expenses representation
            await connection.query(
                `UPDATE expenses SET 
          amount = ?, date = ?, description = ? 
         WHERE service_record_id = ?`,
                [cost, serviceDate, `Service Log: ${description}`, recordId]
            );

            await connection.commit();

            const [updated] = await pool.query(
                `SELECT sr.*, sc.name AS category_name 
         FROM service_records sr 
         LEFT JOIN service_categories sc ON sr.category_id = sc.id 
         WHERE sr.id = ?`,
                [recordId]
            );

            res.status(200).json({
                success: true,
                message: "Service record updated successfully",
                data: updated[0]
            });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        next(err);
    }
};

// @desc    Delete service record
// @route   DELETE /api/service-records/:id
// @access  Private
const deleteServiceRecord = async (req, res, next) => {
    const recordId = req.params.id;

    try {
        const access = await verifyRecordOwnership(recordId, req.user.id, req.user.role);
        if (!access.exists) {
            return res.status(404).json({
                success: false,
                message: "Service record not found.",
                error: null
            });
        }

        if (!access.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized deletion attempt.",
                error: null
            });
        }

        // Expense is deleted cascaded automatically if using foreign key, but let's double check.
        // If set null is used, we should manually clean it up. Let's delete the expense associated to this record.
        await pool.query('DELETE FROM expenses WHERE service_record_id = ?', [recordId]);
        await pool.query('DELETE FROM service_records WHERE id = ?', [recordId]);

        res.status(200).json({
            success: true,
            message: "Service record and matching automatic expense deleted successfully",
            data: {}
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getServiceCategories,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    getServiceRecords,
    createServiceRecord,
    getServiceRecordById,
    updateServiceRecord,
    deleteServiceRecord
};
