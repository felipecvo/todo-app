const db = require('../persistence');

module.exports = async (req, res, next) => {
    console.log(`Request URL: ${req.method} ${req.url}`);
    if (req.url === '/api/keys' && req.method === 'POST') {
        return next();
    }
    if (req.url === '/api/greeting' && req.method === 'GET') {
        return next();
    }
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
