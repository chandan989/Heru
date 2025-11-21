/**
 * Heru Pharmaceutical Backend Server
 * Express.js server with SQLite database for medicine batch tracking
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const database = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
database.initialize().catch(console.error);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Heru Pharmaceutical Backend',
        timestamp: new Date().toISOString(),
        database: 'SQLite connected'
    });
});

// Batch endpoints
app.get('/api/batches', async (req, res) => {
    try {
        const batches = await database.getAllBatches();
        res.json(batches);
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({ error: 'Failed to fetch batches' });
    }
});

app.get('/api/batches/:id', async (req, res) => {
    try {
        const batch = await database.getBatch(req.params.id);
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        res.json(batch);
    } catch (error) {
        console.error('Error fetching batch:', error);
        res.status(500).json({ error: 'Failed to fetch batch' });
    }
});

app.post('/api/batches', async (req, res) => {
    try {
        const result = await database.createBatch(req.body);
        const batch = await database.getBatch(req.body.id);
        res.status(201).json(batch);
    } catch (error) {
        console.error('Error creating batch:', error);
        res.status(500).json({ error: 'Failed to create batch' });
    }
});

app.put('/api/batches/:id', async (req, res) => {
    try {
        await database.updateBatch(req.params.id, req.body);
        const batch = await database.getBatch(req.params.id);
        res.json(batch);
    } catch (error) {
        console.error('Error updating batch:', error);
        res.status(500).json({ error: 'Failed to update batch' });
    }
});

app.get('/api/batches/status/:status', async (req, res) => {
    try {
        const batches = await database.getBatchesByStatus(req.params.status);
        res.json(batches);
    } catch (error) {
        console.error('Error fetching batches by status:', error);
        res.status(500).json({ error: 'Failed to fetch batches by status' });
    }
});

// Transaction endpoints
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await database.getAllTransactions();
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

app.get('/api/transactions/batch/:batchId', async (req, res) => {
    try {
        const transactions = await database.getTransactionsByBatch(req.params.batchId);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions for batch:', error);
        res.status(500).json({ error: 'Failed to fetch transactions for batch' });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const result = await database.createTransaction(req.body);
        res.status(201).json({ id: result.id, ...req.body });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Statistics endpoints
app.get('/api/statistics', async (req, res) => {
    try {
        const stats = await database.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

app.get('/api/activity', async (req, res) => {
    try {
        const activity = await database.getRecentActivity();
        res.json(activity);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
});

// Temperature endpoints
app.post('/api/temperature', async (req, res) => {
    try {
        const result = await database.addTemperatureReading(req.body);
        res.status(201).json({ id: result.id, ...req.body });
    } catch (error) {
        console.error('Error adding temperature reading:', error);
        res.status(500).json({ error: 'Failed to add temperature reading' });
    }
});

app.get('/api/temperature/batch/:batchId', async (req, res) => {
    try {
        const readings = await database.getTemperatureReadings(req.params.batchId);
        res.json(readings);
    } catch (error) {
        console.error('Error fetching temperature readings:', error);
        res.status(500).json({ error: 'Failed to fetch temperature readings' });
    }
});

// Audit trail endpoints
app.post('/api/audit', async (req, res) => {
    try {
        const result = await database.addAuditEntry(req.body);
        res.status(201).json({ id: result.id, ...req.body });
    } catch (error) {
        console.error('Error adding audit entry:', error);
        res.status(500).json({ error: 'Failed to add audit entry' });
    }
});

app.get('/api/audit/batch/:batchId', async (req, res) => {
    try {
        const audit = await database.getAuditTrail(req.params.batchId);
        res.json(audit);
    } catch (error) {
        console.error('Error fetching audit trail:', error);
        res.status(500).json({ error: 'Failed to fetch audit trail' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await database.close();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Heru Backend Server running on port ${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database: SQLite`);
});

module.exports = app;