const { pool } = require('../config/db');

// @desc    Get user dashboard stats summary
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Total vehicles owned
        const [vehiclesCount] = await pool.query('SELECT COUNT(*) AS total FROM vehicles WHERE user_id = ?', [userId]);

        // 2. Total expenses incurred
        const [expensesCount] = await pool.query(
            `SELECT SUM(amount) AS total FROM expenses e 
       INNER JOIN vehicles v ON e.vehicle_id = v.id 
       WHERE v.user_id = ?`,
            [userId]
        );

        // 3. Pending & Overdue reminders count
        const [remindersCount] = await pool.query(
            `SELECT 
        COUNT(CASE WHEN mr.status = 'pending' THEN 1 END) AS pending,
        COUNT(CASE WHEN mr.status = 'overdue' THEN 1 END) AS overdue
       FROM maintenance_reminders mr
       INNER JOIN vehicles v ON mr.vehicle_id = v.id
       WHERE v.user_id = ?`,
            [userId]
        );

        // 4. Upcoming services (reminders that are pending and due in the next 30 days)
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];

        const [upcomingServices] = await pool.query(
            `SELECT mr.*, v.brand, v.model, v.registration_number, sc.name AS category_name
       FROM maintenance_reminders mr
       INNER JOIN vehicles v ON mr.vehicle_id = v.id
       LEFT JOIN service_categories sc ON mr.category_id = sc.id
       WHERE v.user_id = ? AND mr.status = 'pending' AND mr.due_date BETWEEN ? AND ?
       ORDER BY mr.due_date ASC`,
            [userId, todayStr, thirtyDaysLaterStr]
        );

        // 5. Recent service history records (last 5 logs)
        const [recentServices] = await pool.query(
            `SELECT sr.*, v.brand, v.model, v.registration_number, sc.name AS category_name
       FROM service_records sr
       INNER JOIN vehicles v ON sr.vehicle_id = v.id
       LEFT JOIN service_categories sc ON sr.category_id = sc.id
       WHERE v.user_id = ?
       ORDER BY sr.service_date DESC LIMIT 5`,
            [userId]
        );

        // 6. Recent AI query analyses (last 5 scans)
        const [recentAiAnalyses] = await pool.query(
            `SELECT ai.*, v.brand, v.model, v.registration_number
       FROM ai_analyses ai
       LEFT JOIN vehicles v ON ai.vehicle_id = v.id
       WHERE ai.user_id = ?
       ORDER BY ai.created_at DESC LIMIT 5`,
            [userId]
        );

        const stats = {
            totalVehicles: vehiclesCount[0].total,
            totalExpenses: parseFloat(expensesCount[0].total || 0).toFixed(2),
            pendingReminders: remindersCount[0].pending,
            overdueReminders: remindersCount[0].overdue,
            upcomingServices,
            recentServices,
            recentAiAnalyses
        };

        res.status(200).json({
            success: true,
            message: "Owner dashboard statistics loaded successfully",
            data: stats
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboardStats
};
