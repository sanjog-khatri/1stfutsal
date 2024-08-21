const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FutsalSchema = new Schema({
    name: String,
    location: String,
    priceWeekday: Number,
    priceSaturday: Number,
    format: { type: String, enum: ['5A', '6A', '7A'], required: true },
    tournaments: [{ type: Schema.Types.ObjectId, ref: 'Tournament'}],
    reviews: [{
        playerId: mongoose.Schema.Types.ObjectId,
        rating: { type: Number, enum: [1, 2, 3, 4, 5], required: true }, 
        comment: String,
        timestamp: { type: Date, default: Date.now }
    }]
});

const FutsalModel = mongoose.model('Futsals', FutsalSchema);
module.exports = FutsalModel;
