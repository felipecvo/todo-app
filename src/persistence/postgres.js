const pg = require('pg');

const {
    POSTGRES_HOST: HOST,
    POSTGRES_USER: USER,
    POSTGRES_PASSWORD: PASSWORD,
    POSTGRES_DB: DB,
    POSTGRES_PORT: PORT = 5432,
} = process.env;

let pool;

async function init() {
    pool = new pg.Pool({
        user: USER,
        host: HOST,
        database: DB,
        password: PASSWORD,
        port: PORT,
    });

    return await pool.query(
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean, note text, tags text, completed_at timestamp, created_at timestamp, api_key varchar(36));' +
            'CREATE TABLE IF NOT EXISTS api_keys (id varchar(36), key varchar(36), user_id varchar(255), created_at timestamp);',
        (err) => {
            if (err) throw err;
            console.log(`Connected to postgres db at host ${HOST}`);
        },
    );
}

async function teardown() {
    return new Promise((resolve, reject) => {
        pool.end((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function getItems(apiKey) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT id, name, completed, note, tags, completed_at, created_at FROM todo_items WHERE api_key=$1',
            [apiKey],
            (err, res) => {
                if (err) return reject(err);
                resolve(
                    res.rows.map((item) =>
                        Object.assign({}, item, {
                            completed: item.completed === true,
                            tags: item.tags ? item.tags.split(',') : [],
                        }),
                    ),
                );
            },
        );
    });
}

async function getItem(id, apiKey) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT id, name, completed, note, tags, completed_at, created_at FROM todo_items WHERE id=$1 AND api_key=$2',
            [id, apiKey],
            (err, res) => {
                if (err) return reject(err);
                resolve(
                    res.rows.map((item) =>
                        Object.assign({}, item, {
                            completed: item.completed === true,
                            tags: item.tags ? item.tags.split(',') : [],
                        }),
                    )[0],
                );
            },
        );
    });
}

async function storeItem(item, apiKey) {
    return new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed, note, tags, completed_at, created_at, api_key) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [
                item.id,
                item.name,
                item.completed,
                item.note,
                item.tags ? item.tags.join(',') : null,
                item.completed_at,
                item.created_at,
                apiKey,
            ],
            (err, res) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function updateItem(id, item, apiKey) {
    return new Promise((resolve, reject) => {
        pool.query(
            'UPDATE todo_items SET name=$1, completed=$2, note=$3, tags=$4, completed_at=$5 WHERE id=$6 AND api_key=$7',
            [
                item.name,
                item.completed,
                item.note,
                item.tags ? item.tags.join(',') : null,
                item.completed ? new Date().toISOString() : null,
                id,
                apiKey,
            ],
            (err, res) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function removeItem(id, apiKey) {
    return new Promise((resolve, reject) => {
        pool.query(
            'DELETE FROM todo_items WHERE id=$1 AND api_key=$2',
            [id, apiKey],
            (err, res) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function storeApiKey(apiKey) {
    return new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO api_keys (id, key, user_id, created_at) VALUES ($1, $2, $3, $4)',
            [
                apiKey.id,
                apiKey.api_key,
                apiKey.user_id,
                new Date().toISOString(),
            ],
            (err, res) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function getApiKey(key) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM api_keys WHERE key=$1', [key], (err, res) => {
            if (err) return reject(err);
            const row = res.rows[0];
            resolve(row);
        });
    });
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
    storeApiKey,
    getApiKey,
};
