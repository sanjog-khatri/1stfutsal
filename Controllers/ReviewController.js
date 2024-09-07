
const FutsalModel = require('../Models/futsal');
const PlayerModel = require('../Models/player');

const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const player_id = req.user._id;
        const futsal_id = req.params.futsal_id;

        console.log('Fetching futsal with ID:', futsal_id);

        const futsal = await FutsalModel.findById(futsal_id);
        if (!futsal) {
            console.log('Futsal not found:', futsal_id);
            return res.status(404).json({ message: 'Futsal not found', success: false });
        }

        // Add or update review
        const reviewIndex = futsal.reviews.findIndex(review => review.player_id.toString() === player_id.toString());

        if (reviewIndex > -1) {
            // Update existing review
            futsal.reviews[reviewIndex].rating = rating;
            futsal.reviews[reviewIndex].comment = comment;
        } else {
            // Add new review
            futsal.reviews.push({ player_id: player_id, rating, comment });
        }

        await futsal.save();

        res.status(201).json({
            message: "Review added successfully",
            reviews: futsal.reviews
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            message: "Failed to add/update review",
            success: false,
            error: error.message
        });
    }
};



const getReviews = async (req, res) => {
    try {
        const futsal_id = req.params._id;
        const futsal = await FutsalModel.findById(futsal_id).populate({
            path: 'reviews.player_id',
            select: 'username' 
        });

        if (!futsal) {
            return res.status(404).json({
                message: "Futsal not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Reviews fetched successfully",
            reviews: futsal.reviews
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reviews",
            success: false,
            error: error.message
        });
    }
};

const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const player_id = req.user._id; // Get player ID from authenticated user
        const review_id = req.params._id; // Use review ID from the request parameters

        // Find the futsal document with the specific review
        const futsal = await FutsalModel.findOne({
            'reviews._id': review_id,
            'reviews.player_id': player_id
        });

        if (!futsal) {
            console.log('Futsal or review not found or you are not authorized:', {
                review_id: review_id,
                player_id: player_id
            });
            return res.status(404).json({
                message: "Review not found or you are not authorized to update",
                success: false
            });
        }

        // Update the review
        futsal.reviews.forEach(review => {
            if (review._id.toString() === review_id.toString()) {
                review.rating = rating;
                review.comment = comment;
            }
        });

        await futsal.save();

        res.status(200).json({
            message: "Review updated successfully",
            reviews: futsal.reviews
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            message: "Failed to update review",
            success: false,
            error: error.message
        });
    }
};


const removeReview = async (req, res) => {
    try {
        const player_id = req.user._id; // Get player ID from authenticated user
        const review_id = req.params._id; // Use review ID from the request parameters

        // Find the futsal by ID and remove the review
        const futsal = await FutsalModel.findOneAndUpdate(
            { 'reviews._id': review_id, 'reviews.player_id': player_id },
            {
                $pull: { reviews: { _id: review_id } }
            },
            { new: true }
        );

        if (!futsal) {
            return res.status(404).json({
                message: "Review not found or you're not authorized",
                success: false
            });
        }

        res.status(200).json({
            message: "Review removed successfully",
            reviews: futsal.reviews
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to remove the review",
            success: false,
            error: error.message
        });
    }
};


module.exports = {
    createReview,
    getReviews,
    updateReview,
    removeReview
}
