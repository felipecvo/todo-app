const db = require('../persistence');

module.exports = async (req, res) => {
    await db.removeItem(req.params.id, req.apiKey.id);
    res.sendStatus(200);
};
