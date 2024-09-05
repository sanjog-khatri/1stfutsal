const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    futsal: { type: Schema.Types.ObjectId, ref: 'Futsal', required: true },
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: Schema.Types.ObjectId, ref: 'TimeSlot', required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled'], 
        default: 'pending' 
    },
    challenge: { 
        type: Schema.Types.ObjectId, 
        ref: 'Challenge', // Updated to match the Challenge model
        default: null 
    }
});

const BookingModel = mongoose.model('Booking', BookingSchema);
module.exports = BookingModel;
