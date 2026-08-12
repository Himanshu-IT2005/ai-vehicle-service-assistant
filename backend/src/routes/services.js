const express = require('express');
const router = express.Router();
const {
    getServiceCategories, createServiceCategory, updateServiceCategory, deleteServiceCategory,
    getServiceRecords, createServiceRecord, getServiceRecordById, updateServiceRecord, deleteServiceRecord
} = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

// Service Categories CRUD
router.get('/categories', getServiceCategories);
router.post('/categories', restrictTo('admin'), createServiceCategory);
router.put('/categories/:id', restrictTo('admin'), updateServiceCategory);
router.delete('/categories/:id', restrictTo('admin'), deleteServiceCategory);

// Service Records CRUD
router.route('/records')
    .get(getServiceRecords)
    .post(createServiceRecord);

router.route('/records/:id')
    .get(getServiceRecordById)
    .put(updateServiceRecord)
    .delete(deleteServiceRecord);

module.exports = router;
