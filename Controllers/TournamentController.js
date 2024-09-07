const TournamentModel = require('../Models/tournament');
const FutsalModel = require('../Models/futsal');
const moment = require('moment'); 

const getTournaments = async (req, res) => {
    try {
        console.log('Fetching all tournaments');
        const tournaments = await TournamentModel.find().populate('futsal');
        console.log('Tournaments fetched successfully:', tournaments);
        res.status(200).json(tournaments);
    } catch (err) {
        console.error('Error fetching tournaments:', err);
        res.status(500).json({ message: 'Error fetching tournaments', error: err.message });
    }
};

const getTournamentById = async (req, res) => {
    try {
        const tournament_id = req.params._id;
        console.log(`Fetching tournament with ID: ${tournament_id}`);
        
        const tournament = await TournamentModel.findById(tournament_id).populate('futsal');
        if (!tournament) {
            console.warn(`Tournament with ID: ${tournament_id} not found`);
            return res.status(404).json({ message: 'Tournament not found' });
        }
        console.log('Tournament fetched successfully:', tournament);
        res.status(200).json(tournament);
    } catch (err) {
        console.error('Error fetching tournament:', err);
        res.status(500).json({ message: 'Error fetching tournament', error: err.message });
    }
};

const createTournament = async (req, res) => {
    try {
        console.log('Creating new tournament with data:', req.body);

        const { name, futsal_id, startDate, endDate, details, teams } = req.body;
        const user_id = req.user._id; // Assuming `req.user` contains authenticated user info

        // Validate futsal existence
        const futsal = await FutsalModel.findById(futsal_id);
        if (!futsal) {
            console.error('Invalid futsal ID or futsal not found');
            return res.status(400).json({ message: 'Invalid futsal ID' });
        }

        // Check if the user is the owner of the futsal
        if (futsal.owner.toString() !== user_id.toString()) {
            console.error('User is not the owner of the futsal');
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this futsal' });
        }

        // Convert date-only to full date (start of the day)
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0); // Set start time to beginning of the day
        end.setHours(23, 59, 59, 999); // Set end time to end of the day

        // Validate teams (optional)
        if (teams && !Array.isArray(teams)) {
            console.error('Teams field must be an array of Player IDs');
            return res.status(400).json({ message: 'Teams field must be an array of Player IDs' });
        }

        // Create new tournament
        const newTournament = new TournamentModel({
            name,
            futsal: futsal_id,
            startDate: start,
            endDate: end,
            details,
            teams 
        });

        const savedTournament = await newTournament.save();
        console.log('Created new tournament successfully:', savedTournament);
        res.status(201).json(savedTournament);
    } catch (err) {
        console.error('Error creating tournament:', err);
        res.status(500).json({ message: 'Error creating tournament', error: err.message });
    }
};


const updateTournament = async (req, res) => {
    try {
        const tournament_id = req.params._id;
        const updates = req.body;
        const user_id = req.user._id; // Assuming `req.user` contains authenticated user info

        console.log(`Updating tournament with ID: ${tournament_id}`);
        
        // Find the tournament and populate futsal details
        const tournament = await TournamentModel.findById(tournament_id).populate('futsal');
        if (!tournament) {
            console.warn(`Tournament with ID: ${tournament_id} not found`);
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if the user is the owner of the futsal
        if (tournament.futsal.owner.toString() !== user_id.toString()) {
            console.error('User is not the owner of the futsal');
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this futsal' });
        }

        // Update the tournament
        const updatedTournament = await TournamentModel.findByIdAndUpdate(tournament_id, updates, { new: true }).populate('futsal');
        
        console.log('Tournament updated successfully:', updatedTournament);
        res.status(200).json(updatedTournament);
    } catch (err) {
        console.error('Error updating tournament:', err);
        res.status(500).json({ message: 'Error updating tournament', error: err.message });
    }
};

const deleteTournament = async (req, res) => {
    try {
        const tournament_id = req.params._id;
        const user_id = req.user._id; // Assuming `req.user` contains authenticated user info

        console.log(`Deleting tournament with ID: ${tournament_id}`);

        // Find the tournament and populate futsal details
        const tournament = await TournamentModel.findById(tournament_id).populate('futsal');
        if (!tournament) {
            console.warn(`Tournament with ID: ${tournament_id} not found`);
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if the user is the owner of the futsal
        if (tournament.futsal.owner.toString() !== user_id.toString()) {
            console.error('User is not the owner of the futsal');
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this futsal' });
        }

        // Delete the tournament
        await TournamentModel.findByIdAndDelete(tournament_id);
        console.log('Tournament deleted successfully:', tournament);
        res.status(200).json({ message: 'Tournament deleted successfully' });
    } catch (err) {
        console.error('Error deleting tournament:', err);
        res.status(500).json({ message: 'Error deleting tournament', error: err.message });
    }
};


module.exports = {
    getTournaments,
    getTournamentById,
    createTournament,
    updateTournament,
    deleteTournament
};
