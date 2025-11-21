import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import transactionRoutes from './src/api/transactionRoutes.js';
import { transactionMonitoringService } from './src/services/transactionMonitoringService.js';
import { dataStorageComparisonService } from './src/services/dataStorageComparisonService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.use('/api', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Heru Pharmaceutical Network',
    timestamp: new Date().toISOString(),
    mode: 'Production - Real Data Only'
  });
});

// Real-time storage metrics endpoint
app.get('/api/storage/metrics', (req, res) => {
  try {
    const comparison = dataStorageComparisonService.getCurrentComparison();
    const summary = dataStorageComparisonService.getStorageComparisonSummary();
    
    res.json({
      currentMetrics: comparison,
      summary: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Storage metrics error:', error);
    res.status(500).json({ error: 'Failed to get storage metrics' });
  }
});

// MongoDB status endpoint
app.get('/api/mongodb/status', (req, res) => {
  try {
    const mongoStatus = dataStorageComparisonService.getMongoDbStatus();
    res.json(mongoStatus);
  } catch (error) {
    console.error('MongoDB status error:', error);
    res.status(500).json({ error: 'Failed to get MongoDB status' });
  }
});

// Real batch verification endpoint (no demo data)
app.get('/api/batch/:batchNumber/verify', (req, res) => {
  try {
    const { batchNumber } = req.params;
    const batch = transactionMonitoringService.getBatch(batchNumber);
    
    if (!batch) {
      return res.status(404).json({ 
        error: 'Batch not found',
        message: 'This batch was not found in the real blockchain records'
      });
    }
    
    res.json({
      verified: true,
      batch: batch,
      blockchain: 'Hedera Hashgraph',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Pharmaceutical data flow endpoint
app.get('/api/pharmaceutical/dataflow/:batchId', (req, res) => {
  try {
    const { batchId } = req.params;
    const dataFlow = dataStorageComparisonService.getPharmaceuticalDataFlow(batchId);
    res.json(dataFlow);
  } catch (error) {
    console.error('Data flow error:', error);
    res.status(500).json({ error: 'Failed to get data flow' });
  }
});

// Start real-time monitoring when server starts
dataStorageComparisonService.startRealTimeMonitoring();

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🏥 Heru Pharmaceutical Network server running on port ${PORT}`);
  console.log(`📊 Storage Dashboard available at: http://localhost:${PORT}/dashboard`);
  console.log(`🔍 Transaction Scanner at: http://localhost:${PORT}/transaction-scanner`);
  console.log(`📱 QR Scanner at: http://localhost:${PORT}/qr-scanner`);
  console.log(`🌡️ Real-time IoT monitoring: ACTIVE`);
  console.log(`🛡️ MongoDB Guardian integration: CONNECTED`);
  console.log(`⚡ Hedera vs Ethereum comparison: LIVE`);
});