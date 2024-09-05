const BookingModel = require('../Models/booking');
const FutsalModel = require('../Models/futsal');
const TimeSlotModel = require('../Models/timeslot');

// Get booking for a player
const getBookingsForPlayer = async (req, res) => {
    try {
        const user_id = req.user._id; // Extracted from token (can be player or owner)
        console.log('Fetching booking for user ID:', user_id);

        // Ensure the field name in query matches the schema
        const booking = await BookingModel.find({ player: user_id }).populate('futsal');
        console.log('Bookings retrieved:', booking);

        if (booking.length === 0) {
            return res.status(404).json({ message: 'No booking found' });
        }

        res.status(200).json(booking);
    } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({
            message: 'Error fetching booking',
            error: err.message
        });
    }
};



// Get booking for a specific futsal and date
const getBookingsForDateAndFutsal = async (req, res) => {
    try {
        const { futsal_id, date } = req.query;

        if (!futsal_id || !date) {
            return res.status(400).json({ message: 'Futsal ID and date are required' });
        }

        const queryDate = new Date(date);
        if (isNaN(queryDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

        console.log(`Querying for futsal_id: ${futsal_id}`);
        console.log(`Date range: ${startOfDay} to ${endOfDay}`);

        const booking = await BookingModel.find({
            futsal: futsal_id,
            date: { $gte: startOfDay, $lte: endOfDay },
            // Remove or adjust the status filter if needed
        }).populate('player').populate('futsal');

        console.log('Bookings found:', booking);

        if (booking.length === 0) {
            return res.status(404).json({ message: 'No booking found for the specified futsal and date' });
        }

        res.status(200).json(booking);
    } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({
            message: 'Error fetching booking',
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
                    futsal: !futsal_id ? 'Futsal ID is missing' : undefined,
                    slot: !slot ? 'Slot is missing' : undefined,
                },
            });
        }

        console.log('Received booking request:', { user_id, date, futsal_id, slot });

        // Validate the provided slot
        const validSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
        if (!validSlots.includes(slot)) {
            console.error('Invalid time slot:', slot);
            return res.status(400).json({
                message: 'Invalid time slot',
                providedSlot: slot
            });
        }

        // Find the futsal
        const futsal = await FutsalModel.findById(futsal_id);
        if (!futsal) {
            console.error('Futsal not found for ID:', futsal_id);
            return res.status(404).json({
                message: 'Futsal not found'
            });
        }
        console.log('Futsal found:', futsal);

        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Find the time slot that is available (ensure it is not booked)
        const timeSlot = await TimeSlotModel.findOneAndUpdate(
            {
                futsal: futsal_id,
                date: { $gte: startOfDay, $lte: endOfDay },
                startTime: slot,
                isBooked: false // Only check if it's not booked
            },
            { $set: { isBooked: true } }, // Mark it as booked
            { new: true }
        );

        if (!timeSlot) {
            console.error('Time slot not available:', {
                futsal_id,
                date,
                slot
            });
            return res.status(400).json({
                message: 'Time slot not available'
            });
        }

        console.log('Time slot booked:', timeSlot);

        // Create the booking
        const bookingData = {
            date: timeSlot.date,
            futsal: futsal_id,
            timeSlot: timeSlot._id,
            player: user_id
        };

        // Check if an existing booking for the same player and time slot already exists (excluding cancelled bookings)
        const existingBooking = await BookingModel.findOne({
            futsal: futsal_id,
            player: user_id,
            date: timeSlot.date,
            timeSlot: timeSlot._id,
            status: { $in: ['pending', 'confirmed'] } // Only prevent if status is 'pending' or 'confirmed'
        });

        if (existingBooking) {
            console.error('Booking already exists for the same time slot:', existingBooking);
            return res.status(400).json({
                message: 'Booking already exists for this time slot'
            });
        }

        // Proceed to create the new booking
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



// Cancel a booking
const cancelBooking = async (req, res) => {
    try {
        const { _id } = req.params;
        const user_id = req.user._id; // Extract the current user's ID from the token

        // Find the booking and populate the timeSlot field
        const booking = await BookingModel.findById(_id).populate('timeSlot');

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found',
                success: false
            });
        }

        // Check if the current user is the player who created the booking
        if (booking.player.toString() !== user_id.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to cancel this booking',
                success: false
            });
        }

        // Delete the booking
        await BookingModel.findByIdAndDelete(_id);

        // Update the time slot to set isBooked to false
        if (booking.timeSlot && booking.timeSlot._id) {
            await TimeSlotModel.findByIdAndUpdate(
                booking.timeSlot._id,
                { $set: { isBooked: false } },
                { new: true } // Return the updated document
            );
        }

        // Respond with success message
        res.status(200).json({
            message: 'Booking cancelled and time slot is now available'
        });
    } catch (err) {
        console.error('Error cancelling booking:', err);
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
        const owner_id = req.user._id; // Extract the current owner's ID from the token

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
        if (booking.futsal.owner._id.toString() !== owner_id.toString()) {
            console.warn('Unauthorized access attempt by owner ID:', owner_id);
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
        const owner_id = req.user._id; // Extract the current owner's ID from the token

        // Find the booking and populate the futsal and timeSlot fields
        const booking = await BookingModel.findById(booking_id).populate('futsal').populate('timeSlot');

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

        // Check if the owner is authorized to reject this booking
        if (booking.futsal.owner.toString() !== owner_id.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to reject this booking'
            });
        }

        // Reject booking regardless of current status (confirmed, pending, etc.)
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                message: 'Booking is already cancelled'
            });
        }

        // Set the booking status to 'cancelled'
        booking.status = 'cancelled';
        await booking.save();

        // Update the time slot to make it available again
        if (booking.timeSlot && booking.timeSlot.isBooked) {
            await TimeSlotModel.findByIdAndUpdate(
                booking.timeSlot._id,
                { $set: { isBooked: false } },
                { new: true } // Return the updated document
            );
        }

        res.status(200).json({
            message: 'Booking rejected successfully',
            booking
        });
    } catch (err) {
        console.error('Error rejecting booking:', err);
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
    cancelBooking,
    acceptBooking,
    rejectBooking
};
