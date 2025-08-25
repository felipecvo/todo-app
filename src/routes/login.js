const db = require('../persistence');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../utils/password');

const JWT_PRIVATE_SECRET = process.env.JWT_PRIVATE_SECRET || 'your_jwt_secret';

module.exports = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    const hashedPassword = await hashPassword(password);
    console.log(hashedPassword);
    const user = await db.getUserByCredentials(
        email,
        hashedPassword,
        req.apiKey.id,
    );

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        {
            sub: user.id,
            username: user.name,
            role: user.subscription,
            email: user.email,
        },
        JWT_PRIVATE_SECRET,
        { expiresIn: '1h' },
    );

    res.json({ token });
};
