const ChallengeModel = require('../Models/challenge');
const BookingModel = require('../Models/booking'); 

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
            booking: booking_id, 
            date: new Date(), // Set the current date 
            status: 'pending'
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
            error: err.message 
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

        // Ensure that the challenge is in a pending state
        if (challenge.status !== 'pending') {
            return res.status(400).json({
                message: 'Challenge is not in a pending state'
            });
        }

        // Ensure that the challenge creator cannot accept their own challenge
        if (challenge.player.toString() === playerId.toString()) {
            return res.status(403).json({
                message: 'You cannot accept your own challenge'
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
            error: err.message 
        });
    }
};

const removeChallenge = async (req, res) => {
    try {
        const { challenge_id } = req.params;
        const user_id = req.user ? req.user._id : null; // Get the logged-in user's ID

        if (!user_id) {
            return res.status(401).json({
                message: 'User ID is missing from authentication token'
            });
        }

        // Find the challenge by ID and populate the player
        const challenge = await ChallengeModel.findById(challenge_id).populate('player');

        if (!challenge) {
            return res.status(404).json({
                message: 'Challenge not found'
            });
        }

        // Check if the user is the creator of the challenge
        if (challenge.player._id.toString() !== user_id.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to remove this challenge'
            });
        }

        // Remove the challenge by deleting it
        await ChallengeModel.findByIdAndDelete(challenge_id);

        // Optionally, update the associated booking to remove the challenge reference
        await BookingModel.findByIdAndUpdate(challenge.booking, {
            $unset: { challenge: "" } // Remove the challenge reference from the booking
        });

        res.status(200).json({
            message: 'Challenge removed successfully',
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error removing challenge',
            error: err.message
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
        const challenge = await ChallengeModel.findById(challenge_id);

        if (!challenge) {
            return res.status(404).json({
                message: 'Challenge not found'
            });
        }

        // Check if the user is the one who accepted the challenge
        if (challenge.acceptedBy && challenge.acceptedBy.toString() !== user_id.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to cancel this challenge'
            });
        }

        // Ensure the user is canceling an accepted challenge
        if (challenge.status !== 'accepted') {
            return res.status(400).json({
                message: 'Challenge is not in an accepted state'
            });
        }

        // Revert the challenge status to 'pending' and save the change
        challenge.status = 'pending';
        await challenge.save();

        // Optionally, update the booking status as well if needed
        await BookingModel.findByIdAndUpdate(challenge.booking, {
            $set: { status: 'pending' } // Reset the booking status
        });

        // Prevent the same user from accepting the challenge again
        await ChallengeModel.findByIdAndUpdate(challenge._id, {
            $addToSet: { cancelledBy: user_id } // Add user to a list of people who cancelled the challenge
        });

        res.status(200).json({
            message: 'Challenge cancelled, status reverted to pending',
            challenge
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error cancelling challenge',
            error: err.message
        });
    }
};

module.exports = {
    createChallenge,
    acceptChallenge,
    removeChallenge,
    cancelChallenge
};