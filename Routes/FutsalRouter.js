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
const { getTimeSlotsByDate } = require('../Controllers/TimeSlotsController'); // Destructure properly

// Route to get all futsals
router.get('/search', authenticateToken, authorizeRoles(['player']), getFutsals);

// Route to get a futsal by ID
router.get('/search/:_id', authenticateToken, authorizeRoles(['player']), getFutsalById);

// Route to create a new futsal
router.post('/create', authenticateToken, authorizeRoles(['owner']), validateFutsal, createFutsal);

// Route to update a futsal by ID
router.put('/:_id', authenticateToken, authorizeRoles(['owner']), validateFutsal, updateFutsal);

// Route to delete a futsal by ID
router.delete('/:_id', authenticateToken, authorizeRoles(['owner']), deleteFutsal);

// Route to get time slots for a specific futsal
router.get('/:_id/timeslots', authenticateToken, getTimeSlotsByDate);

module.exports = router;
