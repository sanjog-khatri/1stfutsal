const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const OwnerModel = require("../Models/owner");

const ownerSignup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const owner = await OwnerModel.findOne({ email });
        if (owner) {
            return res.status(400)
                .json({
                    message: 'Owner already exists, you can login',
                    success: false
                });
        }
        const ownerModel = new OwnerModel({ username, email, password });
        ownerModel.password = await bcrypt.hash(password, 10);
        await ownerModel.save();
        res.status(201)
            .json({
                message: "Signup successful",
                success: true
            });
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            });
    }
}

const ownerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const owner = await OwnerModel.findOne({ email });
        const errMessage = 'Email or password might be incorrect';
        if (!owner) {
            return res.status(400)
                .json({
                    message: errMessage,
                    success: false
                });
        }
        const isPasswordEqual = await bcrypt.compare(password, owner.password);
        if (!isPasswordEqual) {
            return res.status(403)
                .json({
                    message: errMessage,
                    success: false
                });
        }
        const jwtToken = jwt.sign(
            { email: owner.email, _id: owner._id },
            process.env.JWT_SECRET,
            { expiresIn: '120h' }
        );
        res.status(200)
            .json({
                message: "Login success",
                success: true,
                jwtToken,
                email,
                username: owner.username
            });
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            });
    }
}

module.exports = {
    ownerLogin,
    ownerSignup
}
