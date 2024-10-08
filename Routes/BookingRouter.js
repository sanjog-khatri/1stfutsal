const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getBookingsForPlayer, 
    getBookingsForDateAndFutsal, 
    cancelBooking, 
    acceptBooking, 
    rejectBooking 
                } = require('../Controllers/BookingController');

const authorizeRoles = require('../Middlewares/AuthRole');
const authenticateToken = require('../Middlewares/AuthToken');

router.post('/create', authenticateToken, authorizeRoles(['player']), createBooking);
router.get('/get', authenticateToken, authorizeRoles(['player']), getBookingsForPlayer);
router.get('/search', authenticateToken, getBookingsForDateAndFutsal);
router.delete('/:_id',authenticateToken, authorizeRoles(['player']), cancelBooking);

router.post('/accept/:booking_id', authenticateToken, authorizeRoles(['owner']), acceptBooking);
router.post('/reject/:booking_id', authenticateToken, authorizeRoles(['owner']), rejectBooking);

module.exports = router;