const express = require('express');
const router = express.Router();

const {
    createChallenge,
    acceptChallenge,
    rejectChallenge
} = require('../Controllers/ChallengeController');

const authenticateToken = require('../Middlewares/AuthToken');
const authorizeRoles = require('../Middlewares/AuthRole');

// Route to create a new challenge
router.post('/', authenticateToken, createChallenge);

// Route to accept a challenge
router.post('/accept/:challengeId', authenticateToken, authorizeRoles(['owner']), acceptChallenge);

// Route to reject a challenge
router.post('/reject/:challengeId', authenticateToken, authorizeRoles(['owner']), rejectChallenge);

module.exports = router;
