const mongoose = require('mongoose');

const futsalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    priceWeekday: { type: Number, min: 0, required: true },
    priceSaturday: { type: Number, min: 0, required: true },
    format: { type: String, enum: ['5A', '6A', '7A'], required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    slotDuration: { type: Number, required: true },
    tournaments: [{ type: String }],
    reviews: [{
        player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    contact: { type: String, required: true }  
});

const FutsalModel = mongoose.model('Futsal', futsalSchema);

module.exports = FutsalModel;
