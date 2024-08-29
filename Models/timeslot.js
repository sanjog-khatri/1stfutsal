const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    futsalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Futsal', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false }
});

const TimeSlotModel = mongoose.model('TimeSlot', timeSlotSchema);

module.exports = TimeSlotModel;
