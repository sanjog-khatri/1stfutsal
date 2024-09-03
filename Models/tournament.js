const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    futsal: { type: mongoose.Schema.Types.ObjectId, ref: 'Futsal', required: true }, // Reference to the futsal
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    details: { type: String },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }] // Array of Player references
});

const TournamentModel = mongoose.model('Tournament', tournamentSchema);

module.exports = TournamentModel;
