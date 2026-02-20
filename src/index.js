const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(__dirname + '/openapi.yaml');
const db = require('./persistence');
const getGreeting = require('./routes/getGreeting');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');
const getItem = require('./routes/getItem');
const addApiKey = require('./routes/addApiKey');
const authMiddleware = require('./middleware/auth');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname + '/static'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(authMiddleware);

app.get('/api/greeting', getGreeting);
app.get('/api/items', getItems);
app.post('/api/items', addItem);
app.put('/api/items/:id', updateItem);
app.delete('/api/items/:id', deleteItem);
app.get('/api/items/:id', getItem);
app.post('/api/keys', addApiKey);

db.init()
    .then(() => {
        app.listen(port, () => console.log(`Listening on port ${port}`));
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
