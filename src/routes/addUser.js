const db = require('../persistence');
const { v4: uuid } = require('uuid');
const { hashPassword } = require('../utils/password');

module.exports = async (req, res) => {
    if (!req.body.name) {
        return res.status(400).send({ message: 'User name is required' });
    }
    if (!req.body.email) {
        return res.status(400).send({ message: 'User email is required' });
    }
    if (!req.body.password) {
        return res.status(400).send({ message: 'User password is required' });
    }
    if (req.body.password.length < 6) {
        return res.status(400).send({
            message: 'User password must be at least 6 characters long',
        });
    }

    const user = {
        id: uuid(),
        name: req.body.name,
        email: req.body.email,
        password_hash: await hashPassword(req.body.password),
        api_key_id: req.apiKey.id,
        created_at: new Date().toISOString(),
    };

    try {
        await db.storeUser(user);

        const { created_at, api_key_id, ...userWithoutSensitive } = user;
        res.send(userWithoutSensitive);
    } catch (error) {
        if (error.code === '23505') {
            return res
                .status(409)
                .send({ message: 'A user with this email already exists.' });
        } else {
            console.error('Error storing user:', error);
            return res.status(500).send({ message: 'Internal server error' });
        }
    }
};
