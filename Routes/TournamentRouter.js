const express = require('express');
const router = express.Router();

const { getTournaments, createTournament, updateTournament, deleteTournament } = require('../Controllers/TournamentController');
const authenticateToken = require('../Middlewares/AuthToken');

router.get('/', authenticateToken, getTournaments);
router.post('/create',authenticateToken, createTournament);
router.put('/:_id',authenticateToken, updateTournament);
router.delete('/:_id',authenticateToken, deleteTournament);

module.exports = router;
