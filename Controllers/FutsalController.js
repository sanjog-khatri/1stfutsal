const FutsalModel = require('../Models/futsal');
const TimeSlotModel = require('../Models/timeslot');
const { generateTimeSlots } = require('./TimeSlotsController'); 
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
        const futsal_id = req.params._id;
        console.log(`Fetching futsal with ID: ${futsal_id}`);
        
        const futsal = await FutsalModel.findById(futsal_id).populate('tournaments');
        if (!futsal) {
            console.warn(`Futsal with ID: ${futsal_id} not found`);
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

        const { name, location, priceWeekday, priceSaturday, format, tournaments, openingTime, closingTime, slotDuration, contact } = req.body;
        const owner_id = req.user?._id;

        if (!owner_id) {
            console.error('Owner ID is missing from the request');
            return res.status(400).json({ message: 'Owner ID is required' });
        }

        // Validate required fields
        if (!name || !location || !priceWeekday || !priceSaturday || !format || !openingTime || !closingTime || !slotDuration) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const startTime = moment(openingTime, 'HH:mm', true);
        const endTime = moment(closingTime, 'HH:mm', true);
        if (!startTime.isValid() || !endTime.isValid()) {
            return res.status(400).json({ message: 'Invalid time format for openingTime or closingTime' });
        }

        // Create the futsal
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
            owner: owner_id,
            contact
        });

        const savedFutsal = await newFutsal.save();
        console.log('Created new futsal successfully:', savedFutsal);

        // Update the owner to reflect that they have created a futsal
        await OwnerModel.findByIdAndUpdate(owner_id, { hasCreatedFutsal: true });

        // Generate time slots
        const currentDate = moment();
        const daysToGenerate = 30;

        for (let i = 0; i < daysToGenerate; i++) {
            const date = currentDate.clone().add(i, 'days');
            console.log(`Generating time slots for date: ${date.format('YYYY-MM-DD')}`);

            await generateTimeSlots(savedFutsal._id, date, startTime, endTime, slotDuration, owner_id);
        }

        res.status(201).json(savedFutsal);
    } catch (err) {
        console.error('Error creating futsal:', err);
        res.status(500).json({ message: 'Error creating futsal', error: err.message });
    }
};

const updateFutsal = async (req, res) => {
    try {
        console.log(`Updating futsal with ID: ${req.params._id}`);
        const futsal_id = req.params._id;
        const updates = req.body;  

        const futsal = await FutsalModel.findById(futsal_id);
        if (!futsal) {
            console.warn(`Futsal with ID: ${futsal_id} not found`);
            return res.status(404).json({ message: 'Futsal not found' });
        }

        if (!futsal.owner) {
            console.error(`Futsal with ID: ${futsal_id} has no owner`);
            return res.status(500).json({ message: 'Internal server error: Futsal has no owner' });
        }

        console.log('Current user ID:', req.user._id);
        console.log('Futsal owner ID:', futsal.owner.toString());

        if (futsal.owner.toString() !== req.user._id.toString()) {
            console.warn(`User with ID: ${req.user._id} is not the owner of the futsal with ID: ${futsal_id}`);
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this futsal' });
        }

        const updatedFutsal = await FutsalModel.findByIdAndUpdate(futsal_id, updates, { new: true });
        console.log('Futsal updated successfully:', updatedFutsal);
        res.status(200).json(updatedFutsal);
    } catch (err) {
        console.error('Error updating futsal:', err);
        res.status(500).json({ message: 'Error updating futsal', error: err.message });
    }
};


const deleteFutsal = async (req, res) => {
    try {
        console.log(`Deleting futsal with ID: ${req.params._id}`);
        const futsal_id = req.params._id;

        // Find the futsal to be deleted
        const futsal = await FutsalModel.findById(futsal_id);
        if (!futsal) {
            console.warn(`Futsal with ID: ${futsal_id} not found`);
            return res.status(404).json({ message: 'Futsal not found' });
        }

        // Check if the futsal has an owner
        if (!futsal.owner) {
            console.error(`Futsal with ID: ${futsal_id} has no owner`);
            return res.status(500).json({ message: 'Internal server error: Futsal has no owner' });
        }

        console.log('Current user ID:', req.user._id);
        console.log('Futsal owner ID:', futsal.owner.toString());

        // Check if the current user is the owner of the futsal
        if (futsal.owner.toString() !== req.user._id.toString()) {
            console.warn(`User with ID: ${req.user._id} is not the owner of the futsal with ID: ${futsal_id}`);
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this futsal' });
        }

        // Delete related time slots
        await TimeSlotModel.deleteMany({ futsal: futsal_id });
        console.log('Related time slots deleted successfully');

        // Delete the futsal
        const deletedFutsal = await FutsalModel.findByIdAndDelete(futsal_id);
        console.log('Futsal deleted successfully:', deletedFutsal);

        res.status(200).json({ message: 'Futsal and its related time slots deleted successfully' });
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
