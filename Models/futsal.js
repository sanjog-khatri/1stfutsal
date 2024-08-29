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
        playerId: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Keep this field in the schema for reference
});

const FutsalModel = mongoose.model('Futsal', futsalSchema);

module.exports = FutsalModel;
