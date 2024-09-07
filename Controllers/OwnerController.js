const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const OwnerModel = require("../Models/owner");
const FutsalModel = require('../Models/futsal');

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
        
        // Fetch owner details
        const owner = await OwnerModel.findOne({ email });
        const errMessage = 'Email or password might be incorrect';
        
        if (!owner) {
            console.warn(`No owner found with email: ${email}`);
            return res.status(400).json({
                message: errMessage,
                success: false
            });
        }
        
        // Check password
        const isPasswordEqual = await bcrypt.compare(password, owner.password);
        if (!isPasswordEqual) {
            console.warn(`Incorrect password for owner with email: ${email}`);
            return res.status(403).json({
                message: errMessage,
                success: false
            });
        }
        
        // Generate JWT token
        const jwtToken = jwt.sign(
            { email: owner.email, role: owner.role, _id: owner._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log(`Owner logged in successfully with email: ${email}`);

        // Check if the owner has created futsal
        const futsalCount = await FutsalModel.countDocuments({ owner: owner._id });

        // Determine the response based on futsal creation status
        const hasCreatedFutsal = futsalCount > 0;
        
        res.status(200).json({
            message: "Login success",
            success: true,
            jwtToken,
            email,
            username: owner.username,
            hasCreatedFutsal,  // Include this field
            redirect: hasCreatedFutsal ? '/dashboard' : '/futsal/create',  // Redirect based on status
            options: hasCreatedFutsal ? {
                updateFutsal: true,
                manageBookings: true,
                seeReviews: true,
                organizeTournaments: true,
                createAnotherFutsal: true,
                manageOtherFutsals: true
            } : {}  // No options if futsal has not been created
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

const updateOwner = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const owner_id = req.user._id.toString();  // Convert ObjectId to string
        const _id = req.params._id.toString();  // Convert ObjectId to string if necessary

        // Check if the owner is updating their own account
        if (owner_id !== _id) {
            return res.status(403).json({
                message: "You can only update your own account",
                success: false
            });
        }

        const updateFields = {};
        if (email) updateFields.email = email;
        if (username) updateFields.username = username;
        if (password) updateFields.password = await bcrypt.hash(password, 10);

        const updatedOwner = await OwnerModel.findByIdAndUpdate(owner_id, updateFields, { new: true });
        console.log(`Owner account updated successfully for owner ID: ${owner_id}`);
        
        res.status(200).json({
            message: "Account updated successfully",
            success: true,
            updatedOwner
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

const deleteOwner = async (req, res) => {
    try {
        const owner_id = req.user._id.toString();  // Convert ObjectId to string
        const _id = req.params._id.toString();  // Convert ObjectId to string if necessary

        // Check if the owner is deleting their own account
        if (owner_id !== _id) {
            return res.status(403).json({
                message: "You can only delete your own account",
                success: false
            });
        }

        await OwnerModel.findByIdAndDelete(owner_id);
        console.log(`Owner account deleted successfully for owner ID: ${owner_id}`);
        
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
    ownerSignup,
    ownerLogin,
    updateOwner,
    deleteOwner
}
