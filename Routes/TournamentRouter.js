const express = require('express');
const router = express.Router();

const { getTournaments, createTournament, updateTournament, deleteTournament, getTournamentById } = require('../Controllers/TournamentController');
const authenticateToken = require('../Middlewares/AuthToken');
const authorizeRoles = require('../Middlewares/AuthRole');

router.get('/', authenticateToken, authorizeRoles(['player']), getTournaments);
router.get('/:_id', authenticateToken, authorizeRoles(['player']), getTournamentById);
router.post('/create',authenticateToken, authorizeRoles(['owner']), createTournament);
router.put('/:_id',authenticateToken, authorizeRoles(['owner']), updateTournament);
router.delete('/:_id',authenticateToken, authorizeRoles(['owner']), deleteTournament);

module.exports = router;
