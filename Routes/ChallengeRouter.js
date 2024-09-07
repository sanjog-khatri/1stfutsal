const express = require('express');
const router = express.Router();

const {
    createChallenge,
    acceptChallenge,
    cancelChallenge,
    removeChallenge
} = require('../Controllers/ChallengeController');

const authenticateToken = require('../Middlewares/AuthToken');
const authorizeRoles = require('../Middlewares/AuthRole');

router.post('/create', authenticateToken, authorizeRoles(['player']), createChallenge);
router.post('/accept/:challenge_id', authenticateToken, authorizeRoles(['player']), acceptChallenge);
router.delete('/remove/:challenge_id', authenticateToken, authorizeRoles(['player']), removeChallenge);
router.post('/cancel/:challenge_id', authenticateToken, authorizeRoles(['player']), cancelChallenge);

module.exports = router;
