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

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id varchar(36) PRIMARY KEY,
            name varchar(255),
            email varchar(255),
            subscription varchar(255),
            password_hash varchar(255),
            api_key_id varchar(36),
            created_at timestamp
        );
    `);
    await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS users_email_api_key_id_idx ON users(email, api_key_id);
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS todo_items (
            id varchar(36) PRIMARY KEY,
            name varchar(255),
            completed boolean,
            note text,
            tags text,
            completed_at timestamp,
            created_at timestamp,
            user_id varchar(36)
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id varchar(36) PRIMARY KEY,
            key varchar(36),
            student_id varchar(255),
            password_hash varchar(255),
            created_at timestamp
        );
    `);
    console.log(`Connected to postgres db at host ${HOST}`);
}

async function teardown() {
    return new Promise((resolve, reject) => {
        pool.end((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function getItems(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT id, name, completed, note, tags, completed_at, created_at FROM todo_items WHERE user_id=$1',
            [userId],
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

async function getItem(id, userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT id, name, completed, note, tags, completed_at, created_at FROM todo_items WHERE id=$1 AND user_id=$2',
            [id, userId],
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

async function storeItem(item, userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed, note, tags, completed_at, created_at, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [
                item.id,
                item.name,
                item.completed,
                item.note,
                item.tags ? item.tags.join(',') : null,
                item.completed_at,
                item.created_at,
                userId,
            ],
            (err, res) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function updateItem(id, item, userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'UPDATE todo_items SET name=$1, completed=$2, note=$3, tags=$4, completed_at=$5 WHERE id=$6 AND user_id=$7',
            [
                item.name,
                item.completed,
                item.note,
                item.tags ? item.tags.join(',') : null,
                item.completed ? new Date().toISOString() : null,
                id,
                userId,
            ],
            (err, res) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function removeItem(id, userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'DELETE FROM todo_items WHERE id=$1 AND user_id=$2',
            [id, userId],
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
            'INSERT INTO api_keys (id, key, student_id, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)',
            [
                apiKey.id,
                apiKey.api_key,
                apiKey.student_id,
                apiKey.password_hash,
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

async function getApiKeyByStudentId(studentId, password) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM api_keys WHERE student_id=$1 AND password_hash=$2',
            [studentId, password],
            (err, res) => {
                if (err) return reject(err);
                const row = res.rows[0];
                resolve(row);
            },
        );
    });
}

async function storeUser(item) {
    return new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO users (id, name, email, password_hash, subscription, api_key_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [
                item.id,
                item.name,
                item.email,
                item.password_hash,
                item.subscription,
                item.api_key_id,
                new Date().toISOString(),
            ],
            (err, res) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function getUserByCredentials(username, password_hash, apiKeyId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM users WHERE email=$1 AND password_hash=$2 AND api_key_id=$3',
            [username, password_hash, apiKeyId],
            (err, res) => {
                if (err) return reject(err);
                const row = res.rows[0];
                resolve(row);
            },
        );
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
    getApiKeyByStudentId,
    storeUser,
    getUserByCredentials,
};
