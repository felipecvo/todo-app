const pg = require('pg');

const {
    POSTGRES_HOST: HOST,
    POSTGRES_USER: USER,
    POSTGRES_PASSWORD: PASSWORD,
    POSTGRES_DB: DB,
    POSTGRES_PORT: PORT = 5432,
} = process.env;

async function init() {
    const pool = new pg.Pool({
        user: USER,
        host: HOST,
        database: DB,
        password: PASSWORD,
        port: PORT,
    });

    return await pool.query(
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean, note text, tags text, completed_at datetime, created_at datetime) DEFAULT CHARSET utf8mb4',
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

async function getItems() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM todo_items', (err, res) => {
            if (err) return reject(err);
            resolve(
                res.rows.map((item) =>
                    Object.assign({}, item, {
                        completed: item.completed === true,
                        tags: item.tags ? item.tags.split(',') : [],
                    }),
                ),
            );
        });
    });
}

async function getItem(id) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM todo_items WHERE id=$1', [id], (err, res) => {
            if (err) return reject(err);
            resolve(
                res.rows.map((item) =>
                    Object.assign({}, item, {
                        completed: item.completed === true,
                        tags: item.tags ? item.tags.split(',') : [],
                    }),
                )[0],
            );
        });
    });
}

async function storeItem(item) {
    return new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed, note, tags, completed_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [
                item.id,
                item.name,
                item.completed,
                item.note,
                item.tags ? item.tags.join(',') : null,
                item.completed_at,
                item.created_at,
            ],
            (err, res) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function updateItem(id, item) {
    return new Promise((resolve, reject) => {
        pool.query(
            'UPDATE todo_items SET name=$1, completed=$2, note=$3, tags=$4, completed_at=$5 WHERE id=$6',
            [
                item.name,
                item.completed,
                item.note,
                item.tags ? item.tags.join(',') : null,
                item.completed ? new Date().toISOString() : null,
                id,
            ],
            (err, res) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function removeItem(id) {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM todo_items WHERE id=$1', [id], (err, res) => {
            if (err) return reject(err);
            resolve();
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
};
