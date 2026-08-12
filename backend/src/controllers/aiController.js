const { pool } = require('../config/db');

// @desc    Get all AI analyses session histories for user
// @route   GET /api/ai-analyses
// @access  Private
const getAiAnalyses = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT ai.*, v.brand, v.model, v.registration_number
       FROM ai_analyses ai
       LEFT JOIN vehicles v ON ai.vehicle_id = v.id
       WHERE ai.user_id = ?
       ORDER BY ai.created_at DESC`,
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            message: "AI Analyses history retrieved successfully",
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single AI analysis session details
// @route   GET /api/ai-analyses/:id
// @access  Private
const getAiAnalysisById = async (req, res, next) => {
    const analysisId = req.params.id;

    try {
        const [rows] = await pool.query(
            `SELECT ai.*, v.brand, v.model, v.registration_number
       FROM ai_analyses ai
       LEFT JOIN vehicles v ON ai.vehicle_id = v.id
       WHERE ai.id = ?`,
            [analysisId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Analysis report not found.",
                error: null
            });
        }

        const report = rows[0];

        // Check confidentiality/ownership
        if (report.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this query report.",
                error: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Analysis report details retrieved",
            data: report
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Perform AI Diagnostic Symptom scan (Simulated)
// @route   POST /api/ai-analyses
// @access  Private
const analyzeProblem = async (req, res, next) => {
    const { vehicleId, queryText, context } = req.body;

    try {
        if (!queryText) {
            return res.status(400).json({
                success: false,
                message: "Symptom description queryText is required.",
                error: null
            });
        }

        // Verify vehicle belongs to user if provided
        if (vehicleId) {
            const [vRows] = await pool.query('SELECT user_id FROM vehicles WHERE id = ?', [vehicleId]);
            if (vRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Selected vehicle does not exist.",
                    error: null
                });
            }
            if (vRows[0].user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access to selected vehicle.",
                    error: null
                });
            }
        }

        // Simulated diagnosis classification engine (highly robust)
        const textLower = queryText.toLowerCase();
        let category = "General Check-up";
        let severity = "Low";
        let causes = "Minor chassis wear, general fluid level deviations";
        let action = "Schedule a general inspection check-up at your next convenience.";
        let warning = "INFORMATIONAL NOTICE: This analysis is informational/preliminary only and does not replace a professional mechanic's diagnosis.";

        if (textLower.includes('brake') || textLower.includes('squeal') || textLower.includes('grind') || textLower.includes('caliper')) {
            category = "Brake Care & Repair";
            severity = "High";
            causes = "Worn out brake pads, loose caliper bolts, warped brake rotors";
            action = "Get the front brake calipers and pad thickness inspected immediately.";
            warning = "IMMEDIATE DANGER ALERT: Avoid high speeds or mountain driving until brake system checks are complete to prevent sudden braking losses. Output is only an informational recommendation.";
        } else if (textLower.includes('engine') || textLower.includes('smoke') || textLower.includes('spark') || textLower.includes('knock') || textLower.includes('shake')) {
            category = "Engine Tune-ups";
            severity = "High";
            causes = "Spark plug wear, oxygen sensor failure, cylinder misfire, vacuum leak";
            action = "Check engine lights codes using OBD-II scanner and swap spark plugs.";
            warning = "WARNING: If the engine check light flashes, pull over safely to prevent engine block damage. Output is informational/preliminary recommendation only.";
        } else if (textLower.includes('battery') || textLower.includes('click') || textLower.includes('start') || textLower.includes('dead')) {
            category = "Battery & Electrical";
            severity = "Medium";
            causes = "Corroded battery terminals, weak alternator, discharged cell status, ground wire loose";
            action = "Measure battery voltage (should be > 12.6V when off) and clean terminal clamps.";
            warning = "CAUTION: Ensure alternator output rating is checked to avoid sudden electrical shutoffs. Output is informational/preliminary recommendation only.";
        } else if (textLower.includes('tyre') || textLower.includes('tire') || textLower.includes('wheel') || textLower.includes('align') || textLower.includes('pull')) {
            category = "Tyre Rotation & Wheel Alignment";
            severity = "Medium";
            causes = "Uneven inflation pressures, lost wheel balance weights, suspension ball joint wear";
            action = "Measure alignment specs and balance tyres.";
            warning = "SAFETY TIP: Low tread depth reduces wet-weather traction. Inspect tyres for punctures regularly. Output is informational/preliminary recommendation only.";
        } else if (textLower.includes('leak') || textLower.includes('fluid') || textLower.includes('oil') || textLower.includes('coolant')) {
            category = "Fluid & Lubrication Services";
            severity = "Medium";
            causes = "Gasket wear, cracked fluid reservoir hose, loose drain plug seal";
            action = "Inspect underneath the engine block for colored spots (fluid type recognition) and top up levels.";
            warning = "WARNING: Avoid driving if coolant levels are empty to prevent immediate motor melt-downs. Output is informational/preliminary recommendation only.";
        }

        const rawResponse = JSON.stringify({ category, causes: causes.split(', '), severity, recommendedAction: action, safetyWarning: warning });

        // Store in database
        const [result] = await pool.query(
            `INSERT INTO ai_analyses 
        (user_id, vehicle_id, query_text, response_category, response_causes, response_severity, response_action, response_warning, raw_response) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, vehicleId || null, queryText, category, causes, severity, action, warning, rawResponse]
        );

        const [rows] = await pool.query('SELECT * FROM ai_analyses WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: "AI Diagnostics successfully executed (Simulated)",
            data: rows[0]
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Delete AI query record
// @route   DELETE /api/ai-analyses/:id
// @access  Private
const deleteAiAnalysis = async (req, res, next) => {
    const analysisId = req.params.id;

    try {
        const [rows] = await pool.query('SELECT user_id FROM ai_analyses WHERE id = ?', [analysisId]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Analysis report not found.",
                error: null
            });
        }

        if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Unauthorized deletion attempt.",
                error: null
            });
        }

        await pool.query('DELETE FROM ai_analyses WHERE id = ?', [analysisId]);

        res.status(200).json({
            success: true,
            message: "AI analysis report deleted successfully",
            data: {}
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAiAnalyses,
    getAiAnalysisById,
    analyzeProblem,
    deleteAiAnalysis
};
