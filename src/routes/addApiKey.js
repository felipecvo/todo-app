const db = require('../persistence');
const { v4: uuid } = require('uuid');
const { hashPassword } = require('../utils/password');

module.exports = async (req, res) => {
    if (
        !req.headers['x-api-key'] &&
        req.headers['x-api-key'] !== process.env.API_KEY
    ) {
        return res.status(401).send({ message: 'API key is required' });
    }

    if (!req.body || !req.body.student_id) {
        return res.status(400).send({ message: 'Student ID is required' });
    }

    if (!req.body.secret) {
        return res.status(400).send({ message: 'Secret is required' });
    }

    if (req.body.secret.length < 6) {
        return res
            .status(400)
            .send({ message: 'Secret must be at least 6 characters long' });
    }

    const key = {
        id: uuid(),
        api_key: uuid(),
        student_id: req.body.student_id,
        password_hash: await hashPassword(req.body.secret),
    };

    const existent = await db.getApiKeyByStudentId(
        key.student_id,
        key.password_hash,
    );

    if (existent) {
        res.send({ api_key: existent.key });
    } else {
        await db.storeApiKey(key);
        res.send({ api_key: key.api_key });
    }
};
