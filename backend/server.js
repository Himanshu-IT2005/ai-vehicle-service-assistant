const app = require('./src/app');
const { testConnection } = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // 1. Confirm database connection is successful
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.error("FATAL ERROR: Could not connect to MySQL server. Gracefully halting initialization.");
        process.exit(1);
    }

    // 2. Listen on port
    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`  AI Vehicle Service Assistant REST API Server Running  `);
        console.log(`  Port: ${PORT}                                        `);
        console.log(`  Client Link: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
        console.log(`=======================================================`);
    });
};

startServer();
