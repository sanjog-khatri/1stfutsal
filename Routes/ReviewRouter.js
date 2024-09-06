const express = require('express');
const router = express.Router();
const { updateReview, removeReview, getReviews, createReview } = require('../Controllers/ReviewController');
const authenticateToken = require('../Middlewares/AuthToken');
const authorizeRoles = require('../Middlewares/AuthRole');

// Route to create a review for a specific futsal
router.post('/create/:futsal_id', authenticateToken, authorizeRoles(['player']), createReview);

// Route to update a specific review by review ID
router.put('/futsal/:futsal_id/review/:_id', authenticateToken, authorizeRoles(['player']), updateReview);

// Route to remove a specific review by review ID
router.delete('/futsal/:futsalId/review/:_id', authenticateToken, authorizeRoles(['player']), removeReview);

// Route to get all reviews for a specific futsal
router.get('/futsal/:_id/reviews', authenticateToken, getReviews);

module.exports = router;
