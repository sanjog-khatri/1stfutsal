const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChallengeSchema = new Schema({
   futsal: { type: Schema.Types.ObjectId, ref: 'Futsal', required: true }, // Ensure reference name is correct
   player: { type: Schema.Types.ObjectId, ref: 'Player', required: true }, // Ensure reference name is correct
   date: { type: Date, required: true }, // Added required validation
   status: { 
       type: String, 
       enum: ['pending', 'accepted', 'rejected'], 
       default: 'pending' // Default status
   },
   booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true } // Add reference to Booking
});

const ChallengeModel = mongoose.model('Challenge', ChallengeSchema); // Ensure the model name is singular
module.exports = ChallengeModel;
