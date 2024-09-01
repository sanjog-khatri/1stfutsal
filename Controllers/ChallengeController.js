const ChallengeModel = require('../Models/challenge');
const BookingModel = require('../Models/booking'); // Import Booking model

const createChallenge = async (req, res) => {
    try {
        const { futsal, player, date, booking_id } = req.body;

        // Validate required fields
        if (!futsal || !player || !date || !booking_id) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: {
                    futsal: !futsal ? 'Futsal ID is missing' : undefined,
                    player: !player ? 'Player ID is missing' : undefined,
                    date: !date ? 'Date is missing' : undefined,
                    booking_id: !booking_id ? 'Booking ID is missing' : undefined,
                },
            });
        }

        // Create new challenge
        const challenge = new ChallengeModel({
            futsal,
            player,
            date,
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

        // Optionally, you can update the booking or perform other actions if needed
        // For example, notifying the player or updating booking details

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

const rejectChallenge = async (req, res) => {
    try {
        const { challenge_id } = req.params;

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

        // Update the challenge status to 'rejected'
        challenge.status = 'rejected';
        await challenge.save();

        // Optionally, you can update the booking or perform other actions if needed
        // For example, notifying the player or updating booking details

        res.status(200).json({
            message: 'Challenge rejected',
            challenge
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error rejecting challenge',
            error: err.message // Include the error message for clarity
        });
    }
};

module.exports = {
    createChallenge,
    acceptChallenge,
    rejectChallenge
};