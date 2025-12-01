const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'postgres',
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Помилка підключення до БД:', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Помилка виконання запиту:', err.stack);
        }
        console.log('✅ База даних успішно підключена:', result.rows[0].now);
    });
});

module.exports = pool;