const express = require('express');
const router = express.Router();

const {
    createChallenge,
    acceptChallenge,
    cancelChallenge
} = require('../Controllers/ChallengeController');

const authenticateToken = require('../Middlewares/AuthToken');
const authorizeRoles = require('../Middlewares/AuthRole');

// Route to create a new challenge
router.post('/create', authenticateToken, createChallenge);

// Route to accept a challenge
router.post('/accept/:challenge_id', authenticateToken, authorizeRoles(['player']), acceptChallenge);

// Route to reject a challenge
router.post('/cancel/:challenge_id', authenticateToken, authorizeRoles(['player']), cancelChallenge);

module.exports = router;
