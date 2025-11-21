/**
 * Seed Demo Data for Heru Pharmaceutical System
 * Creates impressive demo data for hackathon presentation
 */

const { v4: uuidv4 } = require('uuid');
const database = require('../database/database');

const DEMO_BATCHES = [
    {
        id: uuidv4(),
        batch_number: 'HERU-2024-001',
        medicine: 'COVID-19 mRNA Vaccine (Pfizer)',
        manufacturer: 'African Vaccine Initiative',
        quantity: 2500,
        medicine_type: 'vaccine',
        hts_token_id: '0.0.6952496',
        hcs_topic_id: '0.0.6952497',
        transaction_id: '0.0.6513742@1759629524.820225534',
        guardian_policy_id: '68d974517ba69039ccea4513',
        verifiable_credential_id: 'vc_covid_vaccine_001',
        vc_hash: 'sha256:a1b2c3d4e5f6...',
        ipfs_hash: 'QmX1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9',
        metadata_uri: 'https://gateway.pinata.cloud/ipfs/QmX1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9',
        expiry_date: '2025-12-31',
        manufacturing_date: '2024-01-15',
        temp_min: -25,
        temp_max: -15,
        status: 'delivered',
        is_compliant: true,
        compliance_notes: 'Perfect cold chain maintenance throughout transport'
    },
    {
        id: uuidv4(),
        batch_number: 'HERU-2024-002',
        medicine: 'Insulin Glargine 100 units/mL',
        manufacturer: 'Heru Pharmaceuticals Ltd.',
        quantity: 1000,
        medicine_type: 'insulin',
        hts_token_id: '0.0.6952498',
        hcs_topic_id: '0.0.6952499',
        transaction_id: '0.0.6513742@1759629525.820225535',
        guardian_policy_id: '68d974517ba69039ccea4513',
        verifiable_credential_id: 'vc_insulin_002',
        vc_hash: 'sha256:b2c3d4e5f6g7...',
        ipfs_hash: 'QmY2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0',
        metadata_uri: 'https://gateway.pinata.cloud/ipfs/QmY2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0',
        expiry_date: '2025-06-30',
        manufacturing_date: '2024-01-20',
        temp_min: 2,
        temp_max: 8,
        status: 'shipped',
        is_compliant: true,
        compliance_notes: 'Temperature maintained within specification'
    },
    {
        id: uuidv4(),
        batch_number: 'HERU-2024-003',
        medicine: 'Amoxicillin 500mg Capsules',
        manufacturer: 'Cairo Pharmaceutical Industries',
        quantity: 5000,
        medicine_type: 'antibiotics',
        hts_token_id: '0.0.6952500',
        hcs_topic_id: '0.0.6952501',
        transaction_id: '0.0.6513742@1759629526.820225536',
        guardian_policy_id: '68d974517ba69039ccea4513',
        verifiable_credential_id: 'vc_antibiotics_003',
        vc_hash: 'sha256:c3d4e5f6g7h8...',
        ipfs_hash: 'QmZ3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1',
        metadata_uri: 'https://gateway.pinata.cloud/ipfs/QmZ3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1',
        expiry_date: '2026-01-31',
        manufacturing_date: '2024-01-25',
        temp_min: 15,
        temp_max: 25,
        status: 'verified',
        is_compliant: true,
        compliance_notes: 'Room temperature storage - compliant'
    },
    {
        id: uuidv4(),
        batch_number: 'HERU-2024-004',
        medicine: 'Hepatitis B Vaccine',
        manufacturer: 'Serum Institute of Africa',
        quantity: 3000,
        medicine_type: 'vaccine',
        hts_token_id: '0.0.6952502',
        hcs_topic_id: '0.0.6952503',
        transaction_id: '0.0.6513742@1759629527.820225537',
        guardian_policy_id: '68d974517ba69039ccea4513',
        verifiable_credential_id: 'vc_hepatitis_004',
        vc_hash: 'sha256:d4e5f6g7h8i9...',
        ipfs_hash: 'QmA4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2',
        metadata_uri: 'https://gateway.pinata.cloud/ipfs/QmA4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2',
        expiry_date: '2025-08-15',
        manufacturing_date: '2024-02-01',
        temp_min: 2,
        temp_max: 8,
        status: 'delivered',
        is_compliant: true,
        compliance_notes: 'Successful delivery to rural health centers'
    },
    {
        id: uuidv4(),
        batch_number: 'HERU-2024-005',
        medicine: 'Monoclonal Antibody Treatment',
        manufacturer: 'BioTech Africa',
        quantity: 500,
        medicine_type: 'biologics',
        hts_token_id: '0.0.6952504',
        hcs_topic_id: '0.0.6952505',
        transaction_id: '0.0.6513742@1759629528.820225538',
        guardian_policy_id: '68d974517ba69039ccea4513',
        verifiable_credential_id: 'vc_biologics_005',
        vc_hash: 'sha256:e5f6g7h8i9j0...',
        ipfs_hash: 'QmB5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3',
        metadata_uri: 'https://gateway.pinata.cloud/ipfs/QmB5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3',
        expiry_date: '2024-12-31',
        manufacturing_date: '2024-02-05',
        temp_min: -80,
        temp_max: -60,
        status: 'shipped',
        is_compliant: true,
        compliance_notes: 'Ultra-cold chain maintained with specialized equipment'
    }
];

const DEMO_TRANSACTIONS = [
    {
        id: uuidv4(),
        batch_id: null, // Will be set to first batch ID
        type: 'token_create',
        transaction_id: '0.0.6513742@1759629524.820225534',
        status: 'success',
        hbar_cost: '2.0000',
        gas_used: 45000,
        block_number: 12345678,
        confirmation_time: 2.3,
        explorer_url: 'https://hashscan.io/testnet/transaction/0.0.6513742@1759629524.820225534'
    },
    {
        id: uuidv4(),
        batch_id: null, // Will be set to first batch ID
        type: 'topic_create',
        transaction_id: '0.0.6513742@1759629524.920225534',
        status: 'success',
        hbar_cost: '2.0000',
        gas_used: 42000,
        block_number: 12345679,
        confirmation_time: 1.8,
        explorer_url: 'https://hashscan.io/testnet/transaction/0.0.6513742@1759629524.920225534'
    },
    {
        id: uuidv4(),
        batch_id: null, // Will be set to first batch ID
        type: 'message_submit',
        transaction_id: '0.0.6513742@1759629525.020225534',
        status: 'success',
        hbar_cost: '0.0001',
        gas_used: 21000,
        block_number: 12345680,
        confirmation_time: 1.2,
        explorer_url: 'https://hashscan.io/testnet/transaction/0.0.6513742@1759629525.020225534'
    }
];

async function seedDemoData() {
    console.log('🌱 Seeding demo data for Heru Pharmaceutical System...');
    
    try {
        // Initialize database
        await database.initialize();
        
        // Create demo batches
        console.log('📦 Creating demo medicine batches...');
        for (const batch of DEMO_BATCHES) {
            await database.createBatch(batch);
            console.log(`✅ Created batch: ${batch.batch_number}`);
        }
        
        // Create demo transactions
        console.log('💰 Creating demo blockchain transactions...');
        const batches = await database.getAllBatches();
        
        for (let i = 0; i < DEMO_TRANSACTIONS.length && i < batches.length; i++) {
            const transaction = { ...DEMO_TRANSACTIONS[i] };
            transaction.batch_id = batches[i].id;
            await database.createTransaction(transaction);
            console.log(`✅ Created transaction: ${transaction.transaction_id}`);
        }
        
        // Add some temperature readings
        console.log('🌡️ Adding temperature monitoring data...');
        for (let i = 0; i < Math.min(3, batches.length); i++) {
            const batch = batches[i];
            const readings = [
                {
                    id: uuidv4(),
                    batch_id: batch.id,
                    temperature: batch.temp_min + (batch.temp_max - batch.temp_min) * 0.3,
                    humidity: 65,
                    location: 'Manufacturing Facility',
                    coordinates_lat: 30.0444,
                    coordinates_lng: 31.2357,
                    sensor_id: `HERU-TEMP-${String(i + 1).padStart(3, '0')}`,
                    battery_level: 95,
                    signal_strength: 5,
                    compliance_status: 'compliant',
                    alert_triggered: false,
                    carbon_impact: 0.1
                },
                {
                    id: uuidv4(),
                    batch_id: batch.id,
                    temperature: batch.temp_min + (batch.temp_max - batch.temp_min) * 0.7,
                    humidity: 68,
                    location: 'Distribution Center',
                    coordinates_lat: 30.0626,
                    coordinates_lng: 31.2497,
                    sensor_id: `HERU-TEMP-${String(i + 1).padStart(3, '0')}`,
                    battery_level: 87,
                    signal_strength: 4,
                    compliance_status: 'compliant',
                    alert_triggered: false,
                    carbon_impact: 0.3
                }
            ];
            
            for (const reading of readings) {
                await database.addTemperatureReading(reading);
            }
        }
        
        // Add audit trail entries
        console.log('📋 Creating audit trail entries...');
        for (let i = 0; i < Math.min(2, batches.length); i++) {
            const batch = batches[i];
            const auditEntries = [
                {
                    id: uuidv4(),
                    batch_id: batch.id,
                    event_type: 'BATCH_CREATED',
                    event_data: {
                        batch_number: batch.batch_number,
                        medicine: batch.medicine,
                        quantity: batch.quantity,
                        blockchain_verified: true
                    },
                    actor: 'Heru System',
                    location: 'Manufacturing Facility',
                    hcs_message_id: batch.transaction_id,
                    consensus_timestamp: new Date().toISOString()
                },
                {
                    id: uuidv4(),
                    batch_id: batch.id,
                    event_type: 'QUALITY_VERIFIED',
                    event_data: {
                        verification_status: 'passed',
                        tests_completed: ['potency', 'purity', 'sterility'],
                        compliance_score: 98.5
                    },
                    actor: 'Quality Control Team',
                    location: 'QC Laboratory',
                    hcs_message_id: null,
                    consensus_timestamp: new Date().toISOString()
                }
            ];
            
            for (const entry of auditEntries) {
                await database.addAuditEntry(entry);
            }
        }
        
        // Display statistics
        const stats = await database.getStatistics();
        console.log('\n📊 Demo Data Summary:');
        console.log(`   📦 Total Batches: ${stats.total_batches}`);
        console.log(`   💰 Total Transactions: ${stats.total_transactions}`);
        console.log(`   ℏ  Total HBAR Spent: ${stats.total_hbar_spent}`);
        console.log(`   👥 Patients Protected: ${stats.patients_protected?.toLocaleString()}`);
        console.log(`   💵 Cost Savings: $${stats.cost_savings_usd?.toLocaleString()}`);
        console.log(`   🌍 Global Reach: ${stats.global_reach} countries`);
        console.log(`   ✅ Compliance Rate: ${stats.compliance_rate}%`);
        
        console.log('\n🎉 Demo data seeded successfully!');
        console.log('🚀 Ready for hackathon presentation!');
        
    } catch (error) {
        console.error('❌ Error seeding demo data:', error);
    } finally {
        await database.close();
    }
}

// Run if called directly
if (require.main === module) {
    seedDemoData();
}

module.exports = { seedDemoData, DEMO_BATCHES, DEMO_TRANSACTIONS };