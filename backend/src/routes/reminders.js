const express = require('express');
const router = express.Router();
const {
    getReminders, createReminder, getReminderById, updateReminder, patchReminderComplete, deleteReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getReminders)
    .post(createReminder);

router.route('/:id')
    .get(getReminderById)
    .put(updateReminder)
    .delete(deleteReminder);

router.patch('/:id/complete', patchReminderComplete);

module.exports = router;
