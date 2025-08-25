const db = require('../persistence');

module.exports = async (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
        return res
            .status(401)
            .send({ message: 'Authorization header is required' });
    }

    const token = header.split(' ')[1];
    const apiKey = await db.getApiKey(token);
    if (!apiKey) {
        return res.status(401).send({ message: 'Invalid API key' });
    }

    req.apiKey = apiKey;

    next();
};
