const mongoose = require('mongoose');
const TimeSlotModel = require('../Models/timeslot');
const moment = require('moment');

const generateTimeSlots = async (futsal_id, date, startTime, endTime, slotDuration) => {
    try {
        console.log(`Generating time slots for Futsal ID: ${futsal_id} on date: ${date.format('YYYY-MM-DD')}`);

        let currentTime = moment(startTime, 'HH:mm');
        while (currentTime.isBefore(endTime)) {
            const slotEndTime = currentTime.clone().add(slotDuration, 'minutes');
            const newSlot = new TimeSlotModel({
                futsal: futsal_id,
                date: date.toDate(),
                startTime: currentTime.format('HH:mm'),
                endTime: slotEndTime.format('HH:mm')
            });

            await newSlot.save();
            console.log(`Created time slot: ${currentTime.format('HH:mm')} - ${slotEndTime.format('HH:mm')}`);

            currentTime = slotEndTime;
        }
    } catch (err) {
        console.error('Error generating time slots:', err);
    }
};

const getTimeSlotsByDate = async (req, res) => {
    try {
        const { futsal, date } = req.query;

        if (!futsal || !date) {
            return res.status(400).json({ message: 'Futsal ID and Date are required' });
        }

        // Create a date object from the provided date string
        const queryDate = new Date(date);
        
        // Check if date is valid
        if (isNaN(queryDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        // Create start and end of day dates
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(startOfDay).setUTCHours(23, 59, 59, 999);

        // Log the query parameters
        console.log('Fetching time slots with:', {
            futsal: new mongoose.Types.ObjectId(futsal),
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        // Query the database
        const timeSlot = await TimeSlotModel.find({
            futsal: new mongoose.Types.ObjectId(futsal),
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (timeSlot.length === 0) {
            return res.status(404).json({ message: 'No time slots available for the selected date' });
        }

        res.status(200).json(timeSlot);
    } catch (err) {
        console.error('Error fetching time slots:', err);
        res.status(500).json({ message: 'Error fetching time slots', error: err.message });
    }
};

module.exports = {
    generateTimeSlots,
    getTimeSlotsByDate
};
