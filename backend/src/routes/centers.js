const express = require('express');
const router = express.Router();
const {
    getServiceCenters, getServiceCenterById, createServiceCenter, updateServiceCenter, deleteServiceCenter
} = require('../controllers/centerController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getServiceCenters)
    .post(restrictTo('admin'), createServiceCenter);

router.route('/:id')
    .get(getServiceCenterById)
    .put(restrictTo('admin'), updateServiceCenter)
    .delete(restrictTo('admin'), deleteServiceCenter);

module.exports = router;
