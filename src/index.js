const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const express = require('express');
const app = express();
const db = require('./persistence');
const getGreeting = require('./routes/getGreeting');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');
const getItem = require('./routes/getItem');
const addApiKey = require('./routes/addApiKey');
const apiTokenAuth = require('./middleware/apiTokenAuth');
const jwtAuth = require('./middleware/jwtAuth');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/static'));
app.use('/api-docs', express.static('openapi.yaml'));

app.get('/api/greeting', getGreeting);
app.get('/api/items', jwtAuth, getItems);
app.post('/api/items', jwtAuth, addItem);
app.put('/api/items/:id', jwtAuth, updateItem);
app.delete('/api/items/:id', jwtAuth, deleteItem);
app.get('/api/items/:id', jwtAuth, getItem);
app.post('/api/keys', addApiKey);

app.post('/api/users', apiTokenAuth, require('./routes/addUser'));
app.post('/api/login', apiTokenAuth, require('./routes/login'));

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
