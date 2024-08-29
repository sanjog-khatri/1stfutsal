const mongoose = require('mongoose');
const TimeSlotModel = require('../Models/timeslot');
const moment = require('moment');

const generateTimeSlots = async (futsalId, date, startTime, endTime, slotDuration) => {
    try {
        console.log(`Generating time slots for Futsal ID: ${futsalId} on date: ${date.format('YYYY-MM-DD')}`);

        let currentTime = moment(startTime);
        while (currentTime.isBefore(endTime)) {
            const slotEndTime = currentTime.clone().add(slotDuration, 'minutes');
            const newSlot = new TimeSlotModel({
                futsalId,
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
        const { futsalId, date } = req.query;

        if (!futsalId || !date) {
            return res.status(400).json({ message: 'Futsal ID and Date are required' });
        }

        const queryDate = new Date(date);
        if (isNaN(queryDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

        const timeSlots = await TimeSlotModel.find({
            futsalId: new mongoose.Types.ObjectId(futsalId),
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (timeSlots.length === 0) {
            return res.status(404).json({ message: 'No time slots available for the selected date' });
        }

        res.status(200).json(timeSlots);
    } catch (err) {
        console.error('Error fetching time slots:', err);
        res.status(500).json({ message: 'Error fetching time slots', error: err.message });
    }
};




module.exports = {
    generateTimeSlots,
    getTimeSlotsByDate
};
