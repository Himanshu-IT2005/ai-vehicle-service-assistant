const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: (process.env.DB_HOST || 'localhost').trim(),
    user: (process.env.DB_USER || 'root').trim(),
    password: (process.env.DB_PASSWORD || '').trim(),
    database: (process.env.DB_NAME || 'vehicle_service_assistant').trim(),
    port: parseInt((process.env.DB_PORT || '3306').toString().trim()),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Prevent uncaught database pool crashes
pool.on('error', (err) => {
    console.error('Unexpected MySQL database pool error:', err);
});

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`Database connected successfully to matching registry: ${dbConfig.database} on ${dbConfig.host}`);
        connection.release();
        return true;
    } catch (err) {
        console.error('CRITICAL DATABASE CONNECTION ERROR:', err.message);
        return false;
    }
};

module.exports = {
    pool,
    testConnection
};
