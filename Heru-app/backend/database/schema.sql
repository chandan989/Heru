-- Heru Pharmaceutical Database Schema
-- SQLite database for medicine batch tracking and blockchain integration

-- Medicine Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    batch_number TEXT UNIQUE NOT NULL,
    medicine TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    
    -- Blockchain Integration
    hts_token_id TEXT,
    hcs_topic_id TEXT,
    transaction_id TEXT,
    contract_address TEXT,
    
    -- Guardian Integration
    guardian_policy_id TEXT,
    verifiable_credential_id TEXT,
    vc_hash TEXT,
    
    -- IPFS Storage
    ipfs_hash TEXT,
    metadata_uri TEXT,
    
    -- Batch Details
    medicine_type TEXT CHECK(medicine_type IN ('vaccine', 'insulin', 'antibiotics', 'biologics', 'other')),
    expiry_date TEXT,
    manufacturing_date TEXT,
    temp_min REAL,
    temp_max REAL,
    
    -- Status and Compliance
    status TEXT CHECK(status IN ('created', 'verified', 'shipped', 'delivered', 'expired')) DEFAULT 'created',
    is_compliant BOOLEAN DEFAULT 1,
    compliance_notes TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blockchain Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('token_create', 'topic_create', 'message_submit', 'contract_call')) NOT NULL,
    transaction_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    
    -- Cost and Performance
    hbar_cost TEXT,
    gas_used INTEGER,
    block_number INTEGER,
    confirmation_time REAL,
    
    -- Links and References
    explorer_url TEXT,
    
    -- Timestamps
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches (id) ON DELETE CASCADE
);

-- Temperature Readings Table
CREATE TABLE IF NOT EXISTS temperature_readings (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    temperature REAL NOT NULL,
    humidity REAL,
    location TEXT,
    coordinates_lat REAL,
    coordinates_lng REAL,
    
    -- Sensor Information
    sensor_id TEXT,
    battery_level INTEGER,
    signal_strength INTEGER,
    calibration_date TEXT,
    
    -- Compliance
    compliance_status TEXT CHECK(compliance_status IN ('compliant', 'warning', 'violation')) DEFAULT 'compliant',
    alert_triggered BOOLEAN DEFAULT 0,
    carbon_impact REAL,
    
    -- Timestamps
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches (id) ON DELETE CASCADE
);

-- Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_trail (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data TEXT, -- JSON data
    actor TEXT,
    location TEXT,
    
    -- Blockchain Reference
    hcs_message_id TEXT,
    consensus_timestamp TEXT,
    
    -- Timestamps
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES batches (id) ON DELETE CASCADE
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON batches(created_at);
CREATE INDEX IF NOT EXISTS idx_batches_batch_number ON batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_transactions_batch_id ON transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_temperature_batch_id ON temperature_readings(batch_id);
CREATE INDEX IF NOT EXISTS idx_temperature_timestamp ON temperature_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_batch_id ON audit_trail(batch_id);

-- Views for Analytics
CREATE VIEW IF NOT EXISTS batch_statistics AS
SELECT 
    COUNT(*) as total_batches,
    COUNT(CASE WHEN status = 'created' THEN 1 END) as created_batches,
    COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_batches,
    COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_batches,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_batches,
    COUNT(CASE WHEN is_compliant = 1 THEN 1 END) as compliant_batches,
    ROUND(AVG(CASE WHEN is_compliant = 1 THEN 100.0 ELSE 0.0 END), 2) as compliance_rate
FROM batches;

CREATE VIEW IF NOT EXISTS transaction_statistics AS
SELECT 
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_transactions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
    SUM(CAST(hbar_cost AS REAL)) as total_hbar_spent,
    AVG(confirmation_time) as avg_confirmation_time
FROM transactions;

CREATE VIEW IF NOT EXISTS recent_activity AS
SELECT 
    'batch' as type,
    id,
    batch_number as title,
    medicine as description,
    status,
    created_at as timestamp
FROM batches
UNION ALL
SELECT 
    'transaction' as type,
    id,
    transaction_id as title,
    type as description,
    status,
    timestamp
FROM transactions
ORDER BY timestamp DESC
LIMIT 50;