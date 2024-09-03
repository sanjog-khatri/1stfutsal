const ChallengeModel = require('../Models/challenge');
const BookingModel = require('../Models/booking'); // Import Booking model

const createChallenge = async (req, res) => {
    try {
        const player = req.user._id; // Get the logged-in player's ID from the token
        const { futsal, booking_id } = req.body;

        // Validate required fields
        if (!futsal || !booking_id) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: {
                    futsal: !futsal ? 'Futsal ID is missing' : undefined,
                    booking_id: !booking_id ? 'Booking ID is missing' : undefined,
                },
            });
        }

        // Create new challenge
        const challenge = new ChallengeModel({
            futsal,
            player, // Automatically set the logged-in player
            booking: booking_id, // Include the booking ID
            date: new Date(), // Set the current date or other logic if needed
            status: 'pending' // Default status
        });
        await challenge.save();

        // Update the related booking to link the challenge
        await BookingModel.findByIdAndUpdate(booking_id, {
            $set: { challenge: challenge._id } // Set the challenge field to the new challenge ID
        });

        res.status(201).json({
            message: 'Challenge created',
            challenge
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error creating challenge',
            error: err.message // Include the error message for clarity
        });
    }
};


const acceptChallenge = async (req, res) => {
    try {
        const { challenge_id } = req.params;
        const playerId = req.user._id; // Assuming player ID is retrieved from the logged-in user's token

        // Find the challenge
        const challenge = await ChallengeModel.findById(challenge_id);

        if (!challenge) {
            return res.status(404).json({
                message: 'Challenge not found'
            });
        }

        if (challenge.status !== 'pending') {
            return res.status(400).json({
                message: 'Challenge is not in a pending state'
            });
        }

        // Update the challenge status to 'accepted'
        challenge.status = 'accepted';
        await challenge.save();

        // Update the booking to reflect the player who accepted the challenge
        await BookingModel.findByIdAndUpdate(challenge.booking, {
            $set: {
                player: playerId, // Update the player field in the booking
                status: 'confirmed' // Optionally update the booking status
            }
        });

        res.status(200).json({
            message: 'Challenge accepted',
            challenge
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error accepting challenge',
            error: err.message // Include the error message for clarity
        });
    }
};


const cancelChallenge = async (req, res) => {
    try {
        const { challenge_id } = req.params;
        const user_id = req.user ? req.user._id : null; // Get the logged-in user's ID

        if (!user_id) {
            return res.status(401).json({
                message: 'User ID is missing from authentication token'
            });
        }

        // Find the challenge by ID
        const challenge = await ChallengeModel.findById(challenge_id).populate('player');

        if (!challenge) {
            return res.status(404).json({
                message: 'Challenge not found'
            });
        }

        // Check if the user is the creator of the challenge
        if (!challenge.player || challenge.player._id.toString() !== user_id.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to cancel this challenge'
            });
        }

        // Set challenge status to 'cancelled'
        challenge.status = 'cancelled';
        await challenge.save();

        // Optionally, update the associated booking to reflect the challenge cancellation
        await BookingModel.findByIdAndUpdate(challenge.booking, {
            $unset: { challenge: "" } // Remove the challenge reference from the booking
        });

        res.status(200).json({
            message: 'Challenge cancelled successfully',
            challenge
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error cancelling challenge',
            error: err.message // Include the error message for clarity
        });
    }
};


module.exports = {
    createChallenge,
    acceptChallenge,
    cancelChallenge
};