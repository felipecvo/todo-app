const db = require('../persistence');
const { v4: uuid } = require('uuid');

module.exports = async (req, res) => {
    if (
        !req.headers['x-api-key'] &&
        req.headers['x-api-key'] !== process.env.API_KEY
    ) {
        return res.status(401).send({ message: 'API key is required' });
    }

    if (!req.body || !req.body.user_id) {
        return res.status(400).send({ message: 'User ID is required' });
    }

    const key = {
        id: uuid(),
        api_key: uuid(),
        user_id: req.body.user_id,
    };

    await db.storeApiKey(key);
    res.send({ api_key: key.api_key });
};
