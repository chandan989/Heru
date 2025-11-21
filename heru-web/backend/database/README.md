# Heru Backend Database 🗄️

This directory contains the SQLite database schema, initialization scripts, and database utilities for the Heru backend.

## 📁 Directory Contents

```
database/
├── database.js      # Database connection and query utilities
├── schema.sql       # Database schema definition
└── heru.db          # SQLite database file (generated)
```

## 🗃️ Database Schema

### Tables

#### **batches**
Stores medicine batch information and blockchain references.

```sql
CREATE TABLE batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    manufacturer TEXT,
    quantity INTEGER,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    hedera_token_id TEXT,
    hedera_topic_id TEXT,
    ipfs_cid TEXT,
    temperature_min REAL,
    temperature_max REAL,
    is_compliant BOOLEAN DEFAULT 0
);
```

**Fields:**
- `batch_id`: Unique batch identifier (e.g., "BATCH-001")
- `name`: Medicine name
- `manufacturer`: Manufacturer name
- `quantity`: Number of units
- `status`: Current status (pending, in_transit, delivered, verified)
- `hedera_token_id`: HTS token ID (e.g., "0.0.12345")
- `hedera_topic_id`: HCS topic ID
- `ipfs_cid`: IPFS content identifier
- `temperature_min/max`: Temperature range requirements
- `is_compliant`: Compliance status

---

#### **transactions**
Blockchain transaction records.

```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    transaction_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    cost_hbar REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    explorer_url TEXT,
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
);
```

**Transaction Types:**
- `TOKEN_CREATE`: HTS token creation
- `TOPIC_CREATE`: HCS topic creation
- `CONSENSUS_MESSAGE`: HCS message submission
- `FILE_CREATE`: HFS file creation
- `TRANSFER`: HBAR transfer
- `CONTRACT_CALL`: Smart contract interaction

---

#### **temperature_readings**
IoT sensor temperature data.

```sql
CREATE TABLE temperature_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT NOT NULL,
    temperature REAL NOT NULL,
    humidity REAL,
    location TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    sensor_id TEXT,
    is_compliant BOOLEAN DEFAULT 1,
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
);
```

**Fields:**
- `temperature`: Temperature in Celsius
- `humidity`: Relative humidity percentage
- `location`: GPS coordinates or location name
- `sensor_id`: IoT sensor identifier
- `is_compliant`: Whether reading is within acceptable range

---

#### **audit_trail**
Complete audit trail for regulatory compliance.

```sql
CREATE TABLE audit_trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
);
```

**Actions:**
- `BATCH_CREATED`
- `TOKEN_MINTED`
- `SHIPMENT_STARTED`
- `TEMPERATURE_ALERT`
- `COMPLIANCE_CHECK`
- `DELIVERY_COMPLETED`
- `VERIFICATION_PERFORMED`

---

### Views

#### **batch_statistics**
Real-time batch analytics.

```sql
CREATE VIEW batch_statistics AS
SELECT 
    COUNT(*) as total_batches,
    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_batches,
    SUM(CASE WHEN is_compliant = 1 THEN 1 ELSE 0 END) as compliant_batches,
    AVG(quantity) as avg_quantity
FROM batches;
```

#### **transaction_statistics**
Blockchain cost analysis.

```sql
CREATE VIEW transaction_statistics AS
SELECT 
    COUNT(*) as total_transactions,
    SUM(cost_hbar) as total_cost_hbar,
    AVG(cost_hbar) as avg_cost_hbar,
    transaction_type,
    COUNT(*) as count_by_type
FROM transactions
GROUP BY transaction_type;
```

#### **recent_activity**
Latest system activity.

```sql
CREATE VIEW recent_activity AS
SELECT 
    batch_id,
    action,
    actor,
    timestamp
FROM audit_trail
ORDER BY timestamp DESC
LIMIT 50;
```

---

## 🚀 Database Initialization

### Initialize Database

```bash
cd backend
npm run init-db
```

This will:
1. Create `heru.db` file
2. Execute `schema.sql`
3. Create all tables and views
4. Set up indexes

### Seed Demo Data

```bash
npm run seed-demo
```

This will populate the database with:
- 5 medicine batches
- 15+ blockchain transactions
- Temperature monitoring data
- Audit trail entries
- Impressive statistics for demo

---

## 📊 Database Utilities

### **database.js**

Provides database connection and query utilities.

#### Connection

```javascript
const db = require('./database/database');

// Database is automatically connected
```

#### Query Methods

```javascript
// Get all batches
const batches = await db.all('SELECT * FROM batches');

// Get single batch
const batch = await db.get('SELECT * FROM batches WHERE batch_id = ?', [batchId]);

// Insert data
await db.run(
  'INSERT INTO batches (batch_id, name, manufacturer) VALUES (?, ?, ?)',
  [batchId, name, manufacturer]
);

// Get statistics
const stats = await db.get('SELECT * FROM batch_statistics');
```

#### Prepared Statements

```javascript
const stmt = await db.prepare('INSERT INTO temperature_readings (batch_id, temperature) VALUES (?, ?)');

for (const reading of readings) {
  await stmt.run(reading.batchId, reading.temperature);
}

await stmt.finalize();
```

---

## 🔍 Common Queries

### Get Batch with Transactions

```sql
SELECT 
    b.*,
    COUNT(t.id) as transaction_count,
    SUM(t.cost_hbar) as total_cost
FROM batches b
LEFT JOIN transactions t ON b.batch_id = t.batch_id
WHERE b.batch_id = ?
GROUP BY b.id;
```

### Get Temperature History

```sql
SELECT 
    temperature,
    humidity,
    location,
    timestamp,
    is_compliant
FROM temperature_readings
WHERE batch_id = ?
ORDER BY timestamp ASC;
```

### Get Compliance Rate

```sql
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN is_compliant = 1 THEN 1 ELSE 0 END) as compliant,
    ROUND(SUM(CASE WHEN is_compliant = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as compliance_rate
FROM batches;
```

### Get Recent Alerts

```sql
SELECT 
    tr.batch_id,
    tr.temperature,
    tr.timestamp,
    b.name,
    b.temperature_min,
    b.temperature_max
FROM temperature_readings tr
JOIN batches b ON tr.batch_id = b.batch_id
WHERE tr.is_compliant = 0
ORDER BY tr.timestamp DESC
LIMIT 10;
```

---

## 🔒 Data Integrity

### Foreign Key Constraints

Foreign keys ensure referential integrity:
- Temperature readings reference valid batches
- Transactions reference valid batches
- Audit trail entries reference valid batches

### Indexes

Indexes for performance:
```sql
CREATE INDEX idx_batch_id ON batches(batch_id);
CREATE INDEX idx_transaction_batch ON transactions(batch_id);
CREATE INDEX idx_temperature_batch ON temperature_readings(batch_id);
CREATE INDEX idx_audit_batch ON audit_trail(batch_id);
CREATE INDEX idx_timestamp ON temperature_readings(timestamp);
```

---

## 📈 Performance Optimization

### Query Optimization
- Use indexes for frequently queried columns
- Limit result sets with LIMIT clause
- Use prepared statements for repeated queries
- Batch insert operations

### Connection Pooling
```javascript
// Database connection is singleton
// Automatically handles connection pooling
```

### Vacuum Database
```bash
sqlite3 database/heru.db "VACUUM;"
```

---

## 🔄 Backup and Restore

### Backup Database

```bash
# Create backup
cp database/heru.db database/heru.db.backup

# Or use SQLite backup
sqlite3 database/heru.db ".backup database/heru.db.backup"
```

### Restore Database

```bash
# Restore from backup
cp database/heru.db.backup database/heru.db
```

### Export to SQL

```bash
sqlite3 database/heru.db .dump > backup.sql
```

### Import from SQL

```bash
sqlite3 database/heru.db < backup.sql
```

---

## 🧪 Testing

### Test Database Connection

```javascript
const db = require('./database/database');

async function testConnection() {
  try {
    const result = await db.get('SELECT 1 as test');
    console.log('Database connected:', result.test === 1);
  } catch (error) {
    console.error('Database error:', error);
  }
}
```

### Test Queries

```bash
# Open SQLite CLI
sqlite3 database/heru.db

# Run test queries
SELECT * FROM batches LIMIT 5;
SELECT * FROM batch_statistics;
```

---

## 📊 Demo Data

The seeded database includes:

### Batches
- **BATCH-001**: Pfizer COVID-19 Vaccine (1000 doses)
- **BATCH-002**: Moderna mRNA Vaccine (500 doses)
- **BATCH-003**: AstraZeneca Vaccine (750 doses)
- **BATCH-004**: Johnson & Johnson Vaccine (300 doses)
- **BATCH-005**: Insulin Vials (200 units)

### Statistics
- **Total Batches**: 5
- **Delivered**: 3
- **Compliance Rate**: 100%
- **Total Cost**: ~0.5 HBAR
- **Patients Protected**: 4,250
- **Cost Savings**: $16,000

---

## 🔧 Maintenance

### Check Database Size

```bash
ls -lh database/heru.db
```

### Analyze Database

```bash
sqlite3 database/heru.db "ANALYZE;"
```

### Check Integrity

```bash
sqlite3 database/heru.db "PRAGMA integrity_check;"
```

---

## 📚 Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite Node.js](https://github.com/TryGhost/node-sqlite3)
- [SQL Tutorial](https://www.w3schools.com/sql/)

---

**Note**: This is a SQLite database optimized for development and demonstration. For production use, consider migrating to PostgreSQL or another enterprise database.
