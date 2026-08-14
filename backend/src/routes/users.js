const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, changePassword, deleteUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', changePassword);
router.delete('/profile', deleteUserProfile);

module.exports = router;
