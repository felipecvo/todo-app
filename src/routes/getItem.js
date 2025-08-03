const db = require('../persistence');

module.exports = async (req, res) => {
    const item = await db.getItem(req.params.id);
    if (item) {
        res.send(item);
    } else {
        res.status(404).send({ message: 'Item not found' });
    }
};
