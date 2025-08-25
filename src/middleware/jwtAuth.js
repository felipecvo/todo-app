const db = require('../persistence');
const jwt = require('jsonwebtoken');
const JWT_PRIVATE_SECRET = process.env.JWT_PRIVATE_SECRET || 'your_jwt_secret';

module.exports = async (req, res, next) => {
    try {
        const header = req.headers['authorization'];
        if (!header || !header.startsWith('Bearer ')) {
            return res
                .status(401)
                .send({ message: 'Authorization header is required' });
        }

        const token = header.split(' ')[1];
        const payload = jwt.verify(token, JWT_PRIVATE_SECRET);

        if (!payload || !payload.sub) {
            return res.status(401).send({ message: 'Invalid token' });
        }

        req.userId = payload.sub;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).send({ message: 'Invalid token' });
    }
};
