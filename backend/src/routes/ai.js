const express = require('express');
const router = express.Router();
const { getAiAnalyses, getAiAnalysisById, analyzeProblem, deleteAiAnalysis } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getAiAnalyses)
    .post(analyzeProblem);

router.route('/:id')
    .get(getAiAnalysisById)
    .delete(deleteAiAnalysis);

module.exports = router;
