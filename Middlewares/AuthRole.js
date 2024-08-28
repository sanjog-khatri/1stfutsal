const PlayerModel = require('../Models/player');
const OwnerModel = require('../Models/owner');

const authorizeRoles = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                console.warn('Unauthorized access attempt: No user information in request');
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { _id, role } = req.user;
            console.log('User ID:', _id); // Debugging: Check the user ID
            console.log('User Role:', role); // Debugging: Check the user role

            let user;

            if (role === 'player') {
                console.log('User is a player. Fetching player data...');
                user = await PlayerModel.findById(_id);
            } else if (role === 'owner') {
                console.log('User is an owner. Fetching owner data...');
                user = await OwnerModel.findById(_id);
            } else {
                console.warn('Invalid role detected:', role);
                return res.status(403).json({ message: 'Forbidden: Invalid role' });
            }

            if (!user) {
                console.warn('User not found in database:', _id);
                return res.status(401).json({ message: 'User not found' });
            }

            if (!roles.includes(role)) {
                console.warn('User role not authorized for this action:', role);
                return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
            }

            req.user = user;
            console.log('User authorized. Proceeding to next middleware.');
            next();
        } catch (error) {
            console.error('Error during authorization:', error.message);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    };
};

module.exports = authorizeRoles;
