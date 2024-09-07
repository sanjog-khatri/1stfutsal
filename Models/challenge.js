const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChallengeSchema = new Schema({
   futsal: { type: Schema.Types.ObjectId, ref: 'Futsal', required: true }, 
   player: { type: Schema.Types.ObjectId, ref: 'Player', required: true }, 
   date: { type: Date, required: true }, 
   status: { 
       type: String, 
       enum: ['pending', 'accepted', 'cancelled'], 
       default: 'pending' 
   },
   booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true }
});

const ChallengeModel = mongoose.model('Challenge', ChallengeSchema); 
module.exports = ChallengeModel;
