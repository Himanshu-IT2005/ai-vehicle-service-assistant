const express = require('express');
const router = express.Router();
const {
    getAdminDashboardStats, getAdminUsers, getAdminUserById, updateAdminUser, deleteAdminUser,
    getAdminVehicles, getAdminVehicleById, getAdminServiceRecords, getAdminAiAnalyses
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', getAdminDashboardStats);

router.route('/users')
    .get(getAdminUsers);

router.route('/users/:id')
    .get(getAdminUserById)
    .put(updateAdminUser)
    .delete(deleteAdminUser);

router.route('/vehicles')
    .get(getAdminVehicles);

router.route('/vehicles/:id')
    .get(getAdminVehicleById);

router.get('/service-records', getAdminServiceRecords);
router.get('/ai-analyses', getAdminAiAnalyses);

module.exports = router;
