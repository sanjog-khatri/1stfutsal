const FutsalModel = require('../Models/futsal');

const getFutsals = async (req, res) => {
    try {
        const futsals = await FutsalModel.find();
        res.status(200).json(futsals);
    } catch (err) {
        res.status(500).json({
            message: 'Error fetching futsals',
            error: err
        });
    }
};

const getFutsalById = async (req, res) => {
    try {
        const futsal = await FutsalModel.findById(req.params.id)
            .populate('tournaments')
            .populate('reviews.playerId', 'username'); 

        if (!futsal) {
            return res.status(404).json({
                message: 'Futsal not found'
            });
        }

        res.status(200).json(futsal);
    } catch (err) {
        res.status(500).json({
            message: 'Error fetching futsal',
            error: err
        });
    }
};

const createFutsal = async (req, res) => {
    try {
        const { name, location, priceWeekday, priceSaturday, format, tournaments, reviews } = req.body;

        const newFutsal = new FutsalModel({
            name,
            location,
            priceWeekday,
            priceSaturday,
            format,
            tournaments,
            reviews
        });

        const savedFutsal = await newFutsal.save();
        res.status(201).json(savedFutsal);
    } catch (err) {
        res.status(500).json({
            message: 'Error creating futsal',
            error: err
        });
    }
};

const updateFutsal = async (req, res) => {
    try {
        const futsalId = req.params.id;
        const updates = req.body;

        const updatedFutsal = await FutsalModel.findByIdAndUpdate(futsalId, updates, { new: true });
        if (!updatedFutsal) {
            return res.status(404).json({
                message: 'Futsal not found'
            });
        }

        res.status(200).json(updatedFutsal);
    } catch (err) {
        res.status(500).json({
            message: 'Error updating futsal',
            error: err
        });
    }
};

const deleteFutsal = async (req, res) => {
    try {
        const futsalId = req.params.id;

        const deletedFutsal = await FutsalModel.findByIdAndDelete(futsalId);

        if (!deletedFutsal) {
            return res.status(400).json({
                message: 'Futsal not found'
            });
        }

        res.status(200).json({
            message: 'Futsal deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error deleting futsal',
            error: err
        });
    }
};

module.exports = {
    getFutsals,
    getFutsalById,
    createFutsal,
    updateFutsal,
    deleteFutsal
};
