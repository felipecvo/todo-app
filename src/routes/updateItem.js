const db = require('../persistence');

module.exports = async (req, res) => {
    await db.updateItem(
        req.params.id,
        {
            name: req.body.name,
            completed: req.body.completed,
        },
        req.userId,
    );
    const item = await db.getItem(req.params.id, req.userId);
    res.send(item);
};
