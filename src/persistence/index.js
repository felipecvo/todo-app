if (process.env.MYSQL_HOST) module.exports = require('./mysql');
else if (process.env.POSTGRES_HOST) module.exports = require('./postgres');
else module.exports = require('./sqlite');
