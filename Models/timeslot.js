const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
    futsal: { type: mongoose.Schema.Types.ObjectId, ref: 'Futsal', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false }
});

const TimeSlotModel = mongoose.model('TimeSlot', TimeSlotSchema);

module.exports = TimeSlotModel;
