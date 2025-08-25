const db = require('../persistence');
const { v4: uuid } = require('uuid');

module.exports = async (req, res) => {
    if (!req.body.name) {
        return res.status(400).send({ message: 'Item name is required' });
    }

    const item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
        note: req.body.note || '',
        tags: req.body.tags || [],
        created_at: new Date().toISOString(),
    };

    await db.storeItem(item, req.userId);

    res.send(item);
};
