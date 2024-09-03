const express = require('express');
const router = express.Router();
const { updateReview, removeReview, getReviews, createReview } = require('../Controllers/ReviewController');
const authenticateToken = require('../Middlewares/AuthToken');
const authorizeRoles = require('../Middlewares/AuthRole');

router.post('/create/:futsal_id', authenticateToken, authorizeRoles(['player']), createReview);
router.put('/:futsal_id', authenticateToken, authorizeRoles(['player']), updateReview);
router.delete('/:futsal_id', authenticateToken, authorizeRoles(['player']), removeReview);
router.get('/:futsal_id', authenticateToken, getReviews);

module.exports = router;
