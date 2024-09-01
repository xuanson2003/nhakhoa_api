const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

// creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    // Lấy token từ header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy phần token từ "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Token is required for authentication' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded.user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            // Token hết hạn
            return res.status(401).json({ error: 'Token has expired. Please login again' });
        }
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = fetchUser;
