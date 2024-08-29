const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const OwnerModel = require("../Models/owner");

const ownerSignup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(`Attempting to sign up owner with email: ${email}`);
        
        const existingOwner = await OwnerModel.findOne({ email });
        if (existingOwner) {
            console.warn(`Owner with email ${email} already exists`);
            return res.status(400).json({
                message: 'Owner already exists, you can login',
                success: false
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newOwner = new OwnerModel({ username, email, password: hashedPassword });
        await newOwner.save();
        
        console.log(`Owner signed up successfully with email: ${email}`);
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

const ownerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Attempting to log in owner with email: ${email}`);
        
        const owner = await OwnerModel.findOne({ email });
        const errMessage = 'Email or password might be incorrect';
        
        if (!owner) {
            console.warn(`No owner found with email: ${email}`);
            return res.status(400).json({
                message: errMessage,
                success: false
            });
        }
        
        const isPasswordEqual = await bcrypt.compare(password, owner.password);
        if (!isPasswordEqual) {
            console.warn(`Incorrect password for owner with email: ${email}`);
            return res.status(403).json({
                message: errMessage,
                success: false
            });
        }
        
        const jwtToken = jwt.sign(
            { email: owner.email, role: owner.role, _id: owner._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log(`Owner logged in successfully with email: ${email}`);
        res.status(200).json({
            message: "Login success",
            success: true,
            jwtToken,
            email,
            username: owner.username
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

module.exports = {
    ownerLogin,
    ownerSignup
}
