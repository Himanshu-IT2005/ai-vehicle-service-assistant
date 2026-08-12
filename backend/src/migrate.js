const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runMigration = async () => {
    const dbConfig = {
        host: (process.env.DB_HOST || 'localhost').trim(),
        user: (process.env.DB_USER || 'root').trim(),
        password: (process.env.DB_PASSWORD || '').trim(),
        database: (process.env.DB_NAME || 'vehicle_service_assistant').trim(),
        port: parseInt((process.env.DB_PORT || '3306').toString().trim()),
        multipleStatements: true
    };

    console.log(`Connecting to database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}...`);
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected! Reading schema.sql...');

        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const seedPath = path.join(__dirname, '../../database/seed.sql');

        let schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Remove custom database creation and use statements to avoid Railway permission errors
        schemaSql = schemaSql.replace(/CREATE DATABASE[\s\S]*?;/i, '');
        schemaSql = schemaSql.replace(/USE [\s\S]*?;/i, '');

        console.log('Executing schema.sql...');
        await connection.query(schemaSql);
        console.log('Schema tables created successfully!');

        if (fs.existsSync(seedPath)) {
            console.log('Reading seed.sql...');
            let seedSql = fs.readFileSync(seedPath, 'utf8');
            seedSql = seedSql.replace(/USE [\s\S]*?;/i, '');
            console.log('Executing seed.sql...');
            await connection.query(seedSql);
            console.log('Seed data imported successfully!');
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

runMigration();
