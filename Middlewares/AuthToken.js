const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    console.log('Received request for', req.originalUrl);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn('No token provided, authorization denied');
        console.log('Returning 401 Unauthorized');
        return res.sendStatus(401); // Unauthorized
    }

    console.log('Token received, verifying...');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Invalid token, access forbidden:', err.message);
            console.log('Returning 403 Forbidden');
            return res.sendStatus(403); // Forbidden
        }

        req.user = user;
        console.log('Authenticated User:', user); // Debugging
        next();
    });
};

module.exports = authenticateToken;
