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

        // Check if tables are initialized by checking for description table/users
        const [rows] = await connection.query("SHOW TABLES LIKE 'users'");
        if (rows.length === 0) {
            console.log("No table 'users' found in database. Initializing database tables automatically...");
            const fs = require('fs');
            const path = require('path');

            const migrationConfig = {
                ...dbConfig,
                multipleStatements: true
            };
            const migrationConnection = await mysql.createConnection(migrationConfig);

            try {
                const schemaPath = path.join(__dirname, 'schema.sql');
                const seedPath = path.join(__dirname, 'seed.sql');

                if (fs.existsSync(schemaPath)) {
                    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
                    // Remove database creation and use statements to prevent Railway permissions errors
                    schemaSql = schemaSql.replace(/CREATE DATABASE[\s\S]*?;/i, '');
                    schemaSql = schemaSql.replace(/USE [\s\S]*?;/i, '');
                    await migrationConnection.query(schemaSql);
                    console.log("Database schema tables auto-created successfully!");
                }

                if (fs.existsSync(seedPath)) {
                    let seedSql = fs.readFileSync(seedPath, 'utf8');
                    seedSql = seedSql.replace(/USE [\s\S]*?;/i, '');
                    await migrationConnection.query(seedSql);
                    console.log("Database seed data auto-imported successfully!");
                }
            } catch (migrationErr) {
                console.error("Failed to execute self-healing database migration:", migrationErr.message);
            } finally {
                await migrationConnection.end();
            }
        } else {
            console.log("Database tables verified (users table already exists).");
        }

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
