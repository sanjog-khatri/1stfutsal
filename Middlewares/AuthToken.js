const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    console.log('Received request for', req.originalUrl);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn('No token provided, authorization denied');
        return res.sendStatus(401); // Unauthorized
    }

    console.log('Token received, verifying...');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Invalid token, access forbidden:', err.message);
            return res.sendStatus(403); // Forbidden
        }

        // Ensure the _id is present in the user payload
        if (!user || !user._id) {
            console.error('User ID is missing from the token payload:', user);
            return res.status(401).json({ message: 'User ID is missing from authentication token' });
        }

        // Attach the user object (including the _id) to the request object
        req.user = user;

        console.log('User ID:', req.user._id);  // Should show the correct ID
        console.log('User Role:', req.user.role);  // Should show 'owner' or 'player'
        
        next();
    });
};

module.exports = authenticateToken;
