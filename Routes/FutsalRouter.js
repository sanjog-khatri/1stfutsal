const express = require('express');
const router = express.Router();
const {
    getFutsals,
    getFutsalById,
    createFutsal,
    updateFutsal,
    deleteFutsal
} = require('../Controllers/FutsalController');
const validateFutsal = require('../Middlewares/FutsalValidation');
const authorizeRoles = require('../Middlewares/AuthRole');
const authenticateToken = require('../Middlewares/AuthToken');
const { getTimeSlotsByDate } = require('../Controllers/TimeSlotsController');

router.get('/search', authenticateToken, authorizeRoles(['player']), getFutsals);
router.get('/search/:_id', authenticateToken, authorizeRoles(['player']), getFutsalById);
router.post('/create', authenticateToken, authorizeRoles(['owner']), validateFutsal, createFutsal);
router.put('/:_id', authenticateToken, authorizeRoles(['owner']), validateFutsal, updateFutsal);
router.delete('/:_id', authenticateToken, authorizeRoles(['owner']), deleteFutsal);
router.get('/timeslots/:futsalId', authenticateToken, getTimeSlotsByDate);

module.exports = router;
