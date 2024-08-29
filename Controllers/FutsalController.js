const FutsalModel = require('../Models/futsal');
const { generateTimeSlots } = require('./TimeSlotsController'); // Assuming the generateTimeSlots function is in timeSlotController
const moment = require('moment');

const getFutsals = async (req, res) => {
    try {
        console.log('Fetching all futsals');
        const futsals = await FutsalModel.find();
        console.log('Futsals fetched successfully:', futsals);
        res.status(200).json(futsals);
    } catch (err) {
        console.error('Error fetching futsals:', err);
        res.status(500).json({ message: 'Error fetching futsals', error: err.message });
    }
};

const getFutsalById = async (req, res) => {
    try {
        console.log(`Fetching futsal with ID: ${req.params.id}`);
        const futsal = await FutsalModel.findById(req.params.id).populate('tournaments');
        if (!futsal) {
            console.warn(`Futsal with ID: ${req.params.id} not found`);
            return res.status(404).json({ message: 'Futsal not found' });
        }
        console.log('Futsal fetched successfully:', futsal);
        res.status(200).json(futsal);
    } catch (err) {
        console.error('Error fetching futsal:', err);
        res.status(500).json({ message: 'Error fetching futsal', error: err.message });
    }
};

const createFutsal = async (req, res) => {
    try {
        console.log('Creating new futsal with data:', req.body);

        const { name, location, priceWeekday, priceSaturday, format, tournaments, openingTime, closingTime, slotDuration } = req.body;
        const ownerId = req.user?.id;

        if (!ownerId) {
            console.error('Owner ID is missing from the request');
            return res.status(400).json({ message: 'Owner ID is required' });
        }

        const newFutsal = new FutsalModel({
            name,
            location,
            priceWeekday,
            priceSaturday,
            format,
            tournaments,
            openingTime,
            closingTime,
            slotDuration,
            ownerId
        });

        const savedFutsal = await newFutsal.save();
        console.log('Created new futsal successfully:', savedFutsal);

        const startTime = moment(openingTime, 'HH:mm');
        const endTime = moment(closingTime, 'HH:mm');
        const currentDate = moment();
        const daysToGenerate = 30;

        for (let i = 0; i < daysToGenerate; i++) {
            const date = currentDate.clone().add(i, 'days');
            console.log(`Generating time slots for date: ${date.format('YYYY-MM-DD')}`);

            await generateTimeSlots(savedFutsal._id, date, startTime, endTime, slotDuration, req.user._id);
        }

        res.status(201).json(savedFutsal);
    } catch (err) {
        console.error('Error creating futsal:', err);
        res.status(500).json({ message: 'Error creating futsal', error: err.message });
    }
};


const updateFutsal = async (req, res) => {
    try {
        console.log(`Updating futsal with ID: ${req.params.id}`);
        const futsalId = req.params.id;
        const updates = req.body;

        // Find the futsal by ID
        const futsal = await FutsalModel.findById(futsalId);
        if (!futsal) {
            console.warn(`Futsal with ID: ${futsalId} not found`);
            return res.status(404).json({ message: 'Futsal not found' });
        }

        // Ensure futsal.ownerId is defined
        if (!futsal.ownerId) {
            console.error(`Futsal with ID: ${futsalId} has no ownerId`);
            return res.status(500).json({ message: 'Internal server error: Futsal has no ownerId' });
        }

        // Check if the user is the owner of the futsal
        if (futsal.ownerId.toString() !== req.user.id) {
            console.warn(`User with ID: ${req.user.id} is not the owner of the futsal with ID: ${futsalId}`);
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this futsal' });
        }

        // Update the futsal
        const updatedFutsal = await FutsalModel.findByIdAndUpdate(futsalId, updates, { new: true });
        console.log('Futsal updated successfully:', updatedFutsal);
        res.status(200).json(updatedFutsal);
    } catch (err) {
        console.error('Error updating futsal:', err);
        res.status(500).json({ message: 'Error updating futsal', error: err.message });
    }
};

const deleteFutsal = async (req, res) => {
    try {
        console.log(`Deleting futsal with ID: ${req.params.id}`);
        const futsalId = req.params.id;

        // Find the futsal by ID
        const futsal = await FutsalModel.findById(futsalId);
        if (!futsal) {
            console.warn(`Futsal with ID: ${futsalId} not found`);
            return res.status(404).json({ message: 'Futsal not found' });
        }

        // Ensure futsal.ownerId is defined
        if (!futsal.ownerId) {
            console.error(`Futsal with ID: ${futsalId} has no ownerId`);
            return res.status(500).json({ message: 'Internal server error: Futsal has no ownerId' });
        }

        // Check if the user is the owner of the futsal
        if (futsal.ownerId.toString() !== req.user.id) {
            console.warn(`User with ID: ${req.user.id} is not the owner of the futsal with ID: ${futsalId}`);
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this futsal' });
        }

        // Delete the futsal
        await FutsalModel.findByIdAndDelete(futsalId);
        console.log('Futsal deleted successfully:', futsal);
        res.status(200).json({ message: 'Futsal deleted successfully' });
    } catch (err) {
        console.error('Error deleting futsal:', err);
        res.status(500).json({ message: 'Error deleting futsal', error: err.message });
    }
};

module.exports = {
    getFutsals,
    getFutsalById,
    createFutsal,
    updateFutsal,
    deleteFutsal
};
