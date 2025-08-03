const db = require('../persistence');

module.exports = async (req, res) => {
    await db.updateItem(
        req.params.id,
        {
            name: req.body.name,
            completed: req.body.completed,
        },
        req.apiKey.id,
    );
    const item = await db.getItem(req.params.id, req.apiKey.id);
    res.send(item);
};
