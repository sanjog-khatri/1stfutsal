const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PlayerModel = require("../Models/player");

const playerSignup = async (req, res) => {  
    try {
        const { username, email, password } = req.body;
        const existingPlayer = await PlayerModel.findOne({ email });
        
        if (existingPlayer) {
            return res.status(400).json({
                message: 'Player already exists, you can login', 
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newPlayer = new PlayerModel({ username, email, password: hashedPassword });
        await newPlayer.save();
        
        res.status(201).json({
            message: "Signup successful",
            success: true
        });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
}

const playerLogin = async (req, res) => {  
    try {
        const { email, password } = req.body;
        const player = await PlayerModel.findOne({ email });
        const errorMsg = 'Email or password might be incorrect';

        if (!player) {
            return res.status(403).json({
                message: errorMsg, 
                success: false
            });
        }

        const isPasswordEqual = await bcrypt.compare(password, player.password);
        
        if (!isPasswordEqual) {
            return res.status(403).json({
                message: errorMsg, 
                success: false
            });
        }

        const jwtToken = jwt.sign(
            { email: player.email, role: player.role, _id: player._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login success",
            success: true,
            jwtToken,
            email,
            username: player.username
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
}

const updatePlayer = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const player_id = req.user._id.toString();  // Convert ObjectId to string
        const _id = req.params._id.toString();  // Convert ObjectId to string

        // Check if the player is updating their own account
        if (player_id !== _id) {
            return res.status(403).json({
                message: "You can only update your own account",
                success: false
            });
        }

        const updateFields = {};
        if (email) updateFields.email = email;
        if (username) updateFields.username = username;
        if (password) updateFields.password = await bcrypt.hash(password, 10);

        const updatedPlayer = await PlayerModel.findByIdAndUpdate(player_id, updateFields, { new: true });
        
        res.status(200).json({
            message: "Account updated successfully",
            success: true,
            updatedPlayer
        });
    } catch (err) {
        console.error('Error during account update:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
}

const deletePlayer = async (req, res) => {
    try {
        const player_id = req.user._id.toString();  // Convert ObjectId to string
        const _id = req.params._id.toString();  // Convert ObjectId to string

        // Check if the player is deleting their own account
        if (player_id !== _id) {
            return res.status(403).json({
                message: "You can only delete your own account",
                success: false
            });
        }

        await PlayerModel.findByIdAndDelete(player_id);
        
        res.status(200).json({
            message: "Account deleted successfully",
            success: true
        });
    } catch (err) {
        console.error('Error during account deletion:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
}

module.exports = {
    playerSignup,
    playerLogin,
    updatePlayer,
    deletePlayer
}
