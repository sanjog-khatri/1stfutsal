const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PlayerModel = require("../Models/player");

const playerSignup = async (req, res) =>
    {  
    try {
        const {username, email, password} = req.body;
        const player = await PlayerModel.findOne({email});
        if(player) {
            return res.status(400)
                .json({
                    message: 'Player already exists, you can login', 
                    success: false});
        }
        const playerModel = new PlayerModel({username, email, password});
        playerModel.password = await bcrypt.hash(password, 10);
        await playerModel.save();
        res.status(201)
            .json({
                message: "Signup successful",
                success: true
            })
    } catch(err) {
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
        })
    }
    }

const playerLogin = async (req, res) =>
{  
    try {
        const {email, password} = req.body;
        const player = await PlayerModel.findOne({email});
        const errorMsg = 'Email or password might be incorrect';
        if(!player) {
            return res.status(403)
                .json({
                    message: errorMsg, 
                    success: false
                });
        }
        const isPasswordEqual = await bcrypt.compare(password, player.password);
        if(!isPasswordEqual) {
            return res.status(403)
                .json({
                    message: errorMsg, 
                    success: false
                });
        }
        const jwtToken = jwt.sign(
            {email: player.email, _id: player._id},
            process.env.JWT_SECRET,
            {expiresIn: '72h'}
        )
        res.status(200)
            .json({
                message: "Login success",
                success: true,
                jwtToken,
                email,
                username: player.username
            })
    } catch(err) {
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
        })
    }
}

    
module.exports = {
playerSignup,
playerLogin
}