/**
 * Initialize Heru Database
 * Creates SQLite database and tables
 */

const database = require('../database/database');

async function initializeDatabase() {
    console.log('🗄️ Initializing Heru SQLite Database...');
    
    try {
        await database.initialize();
        console.log('✅ Database initialized successfully!');
        console.log('📊 Ready for demo data seeding');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        await database.close();
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };