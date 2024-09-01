const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getBookingsForPlayer, 
    getBookingsForDateAndFutsal, 
    updateBooking, 
    cancelBooking, 
    acceptBooking, 
    rejectBooking 
                } = require('../Controllers/BookingController');

const authorizeRoles = require('../Middlewares/AuthRole');
const authenticateToken = require('../Middlewares/AuthToken');

router.post('/', authenticateToken, createBooking);
router.get('/player', authenticateToken, getBookingsForPlayer);
router.get('/search', authenticateToken, getBookingsForDateAndFutsal);
router.put('/:id', authenticateToken, updateBooking);
router.delete('/:id',authenticateToken, authorizeRoles(['player']), cancelBooking);

router.post('/accept/:bookingId', authenticateToken, authorizeRoles(['owner']), acceptBooking);
router.post('/reject/:bookingId', authenticateToken, authorizeRoles(['owner']), rejectBooking);

module.exports = router;