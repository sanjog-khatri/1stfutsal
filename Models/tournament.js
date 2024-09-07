const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    futsal: { type: mongoose.Schema.Types.ObjectId, ref: 'Futsal', required: true }, 
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    details: { type: String },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
});

const TournamentModel = mongoose.model('Tournament', tournamentSchema);

module.exports = TournamentModel;
