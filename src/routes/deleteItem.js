const db = require('../persistence');

module.exports = async (req, res) => {
    await db.removeItem(req.params.id, req.userId);
    res.sendStatus(200);
};
