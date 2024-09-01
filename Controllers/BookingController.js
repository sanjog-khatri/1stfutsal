const BookingModel = require('../Models/booking');
const FutsalModel = require('../Models/futsal');
const TimeSlotModel = require('../Models/timeslot');
// Get bookings for a player
const getBookingsForPlayer = async (req, res) => {
    try {
        const user_id = req.user._id; // Extracted from token (can be player or owner)
        const bookings = await BookingModel.find({ user_id }).populate('futsal');
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({
            message: 'Error fetching bookings',
            error: err.message
        });
    }
};

// Get bookings for a specific futsal and date
const getBookingsForDateAndFutsal = async (req, res) => {
    try {
        const { futsal_id, date } = req.query;

        if (!futsal_id || !date) {
            return res.status(400).json({ message: 'Futsal ID and date are required' });
        }

        // Parse and validate the date
        const queryDate = new Date(date);
        if (isNaN(queryDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

        const bookings = await BookingModel.find({
            futsal_id,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('user')
          .populate('futsal');

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found for the specified futsal and date' });
        }

        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({
            message: 'Error fetching bookings',
            error: err.message
        });
    }
};

// Create a booking with slot validation

const createBooking = async (req, res) => {
    try {
        const user_id = req.user ? req.user._id : null;
        if (!user_id) {
            console.error('User ID is missing from authentication token');
            return res.status(401).json({
                message: 'User ID is missing from authentication token'
            });
        }

        const { date, futsal_id, slot } = req.body;

        if (!date || !futsal_id || !slot) {
            console.error('Missing required fields:', { date, futsal_id, slot });
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: {
                    date: !date ? 'Date is missing' : undefined,
                    futsal_id: !futsal_id ? 'Futsal ID is missing' : undefined,
                    slot: !slot ? 'Slot is missing' : undefined,
                },
            });
        }

        console.log('Received booking request:', { user_id, date, futsal_id, slot });

        const validSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
        if (!validSlots.includes(slot)) {
            console.error('Invalid time slot:', slot);
            return res.status(400).json({
                message: 'Invalid time slot',
                providedSlot: slot
            });
        }

        const futsal = await FutsalModel.findById(futsal_id);
        if (!futsal) {
            console.error('Futsal not found for ID:', futsal_id);
            return res.status(404).json({
                message: 'Futsal not found'
            });
        }
        console.log('Futsal found:', futsal);

        // Adjust the date to ensure correct comparison
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Log the query parameters
        console.log('Searching for time slot with:', {
            futsal_id: futsal_id,
            date: { $gte: startOfDay, $lte: endOfDay },
            startTime: slot,
            isBooked: false
        });

        // Find and update the time slot
        const timeSlot = await TimeSlotModel.findOneAndUpdate(
            {
                futsal_id: futsal_id,
                date: { $gte: startOfDay, $lte: endOfDay }, // Match any time during the date
                startTime: slot, // Ensure this matches the stored time slot
                isBooked: false
            },
            {
                $set: { isBooked: true }
            },
            { new: true }
        );

        if (!timeSlot) {
            console.error('Time slot not available:', {
                futsal_id,
                date: { $gte: startOfDay, $lte: endOfDay },
                startTime: slot
            });
            return res.status(400).json({
                message: 'Time slot not available'
            });
        }

        console.log('Time slot booked:', timeSlot);

        const bookingData = {
            date: timeSlot.date,
            futsal: futsal_id,
            timeSlot: timeSlot._id, // Link to the time slot ID
            player: user_id
        };

        const booking = new BookingModel(bookingData);
        await booking.save();

        res.status(201).json({
            message: 'Booking created successfully',
            booking
        });
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({
            message: 'Error creating booking',
            error: err.message
        });
    }
};



// Update a booking (only update status and other fields if allowed)
const updateBooking = async (req, res) => {
    try {
        const { _id } = req.params;
        const updatedData = req.body;

        const booking = await BookingModel.findByIdAndUpdate(_id, updatedData, { new: true });
        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found',
                success: false
            });
        }
        res.status(200).json({
            message: 'Booking updated',
            booking
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error updating booking',
            error: err.message
        });
    }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
    try {
        const { _id } = req.params;
        const user_id = req.user._id; // Extract the current user's ID from the token

        const booking = await BookingModel.findById(_id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found',
                success: false
            });
        }

        // Check if the current user is the one who created the booking
        if (booking.user_id.toString() !== user_id) {
            return res.status(403).json({
                message: 'You are not authorized to cancel this booking',
                success: false
            });
        }

        await booking.remove();
        res.status(200).json({
            message: 'Booking cancelled',
            booking
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error cancelling booking',
            error: err.message
        });
    }
};

// Accept a booking (owner/admin action)
const acceptBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const ownerId = req.user._id; // Extract the current owner's ID from the token

        // Find the booking and populate futsal and owner details
        const booking = await BookingModel.findById(booking_id).populate({
            path: 'futsal',
            populate: {
                path: 'owner', // Ensure this matches the field name in the Futsal schema
                model: 'Owner'  // Ensure this matches the actual model name used in your application
            }
        });

        // Check if booking exists
        if (!booking) {
            console.error('Booking not found for ID:', booking_id);
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if futsal and owner exist in the booking
        if (!booking.futsal || !booking.futsal.owner) {
            console.error('Booking is missing futsal or owner information for booking ID:', booking_id);
            return res.status(400).json({ message: 'Booking is missing futsal or owner information' });
        }

        // Verify that the owner of the futsal is the one making the request
        if (booking.futsal.owner._id.toString() !== ownerId) {
            console.warn('Unauthorized access attempt by owner ID:', ownerId);
            return res.status(403).json({ message: 'You are not authorized to accept this booking' });
        }

        // Check if the booking is in the 'pending' state
        if (booking.status !== 'pending') {
            console.warn('Booking cannot be accepted as it is not in pending status:', booking_id);
            return res.status(400).json({ message: 'Booking cannot be accepted' });
        }

        // Update the booking status to 'confirmed'
        booking.status = 'confirmed';
        await booking.save();

        console.log('Booking confirmed successfully for booking ID:', booking_id);
        res.status(200).json({
            message: 'Booking confirmed successfully',
            booking
        });
    } catch (err) {
        console.error('Error accepting booking:', err.message);
        res.status(500).json({
            message: 'Error accepting booking',
            error: err.message
        });
    }
};


// Reject a booking (owner/admin action)
const rejectBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const ownerId = req.user._id; // Extract the current owner's ID from the token

        const booking = await BookingModel.findById(booking_id).populate('futsal');

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        if (!booking.futsal || !booking.futsal.owner) {
            return res.status(400).json({
                message: 'Booking is missing futsal or owner information'
            });
        }

        if (booking.futsal.owner.toString() !== ownerId) {
            return res.status(403).json({
                message: 'You are not authorized to reject this booking'
            });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                message: 'Booking cannot be rejected'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            message: 'Booking rejected successfully',
            booking
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error rejecting booking',
            error: err.message
        });
    }
};

module.exports = {
    createBooking,
    getBookingsForPlayer,
    getBookingsForDateAndFutsal,
    updateBooking,
    cancelBooking,
    acceptBooking,
    rejectBooking
};
