/**
 * Complete Medicine Batch Flow Service
 * Demonstrates end-to-end pharmaceutical supply chain tracking
 */

import { hederaNativeService } from './hederaNativeService';
import { realGuardianService } from './realGuardianService';

export interface MedicineTemplate {
  type: 'insulin' | 'vaccine' | 'antibiotics' | 'biologics' | 'painkillers';
  name: string;
  requiresColdChain: boolean;
  tempRange: { min: number; max: number };
  shelfLife: number; // days
  dosage: string;
  manufacturer: string;
  regulatoryInfo: string;
}

export interface BatchLifecycle {
  stage: 'manufacturing' | 'transport' | 'pharmacy' | 'dispensed' | 'recalled';
  timestamp: string;
  location: string;
  actor: string;
  notes?: string;
}

export interface CompleteMedicineBatch {
  // Basic Info
  batchNumber: string;
  medicine: MedicineTemplate;
  
  // Blockchain Data
  htsTokenId?: string;
  hcsTopicId?: string;
  guardianPolicyId?: string;
  
  // Manufacturing
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  lotNumber: string;
  
  // Supply Chain
  lifecycle: BatchLifecycle[];
  currentStage: BatchLifecycle['stage'];
  currentLocation: string;
  
  // Quality Control
  qualityTests: Array<{
    testType: string;
    result: 'PASS' | 'FAIL' | 'PENDING';
    timestamp: string;
    notes?: string;
  }>;
  
  // Cold Chain (if applicable)
  temperatureReadings: Array<{
    timestamp: string;
    temperature: number;
    humidity?: number;
    location: string;
    isCompliant: boolean;
  }>;
  
  // Verification
  qrCode: string;
  verificationUrl: string;
  isAuthentic: boolean;
  complianceStatus: 'COMPLIANT' | 'VIOLATION' | 'CRITICAL';
  
  // Traceability
  supplyChainActors: Array<{
    role: 'manufacturer' | 'transporter' | 'pharmacy' | 'hospital' | 'regulator';
    name: string;
    did?: string;
    timestamp: string;
    action: string;
  }>;
}

export class MedicineBatchFlowService {
  private medicineTemplates: Map<string, MedicineTemplate> = new Map();
  private activeBatches: Map<string, CompleteMedicineBatch> = new Map();
  private batchHistory: Map<string, CompleteMedicineBatch[]> = new Map();

  constructor() {
    this.initializeMedicineTemplates();
    // Real production mode - no demo batches
    console.log('🏥 Heru Pharmaceutical Network - Real-time batch tracking initialized');
  }

  /**
   * Initialize different medicine types with their specific requirements
   */
  private initializeMedicineTemplates() {
    const templates: MedicineTemplate[] = [
      {
        type: 'insulin',
        name: 'Insulin Glargine 100 units/mL',
        requiresColdChain: true,
        tempRange: { min: 2, max: 8 },
        shelfLife: 365,
        dosage: '100 units/mL',
        manufacturer: 'Heru Pharmaceuticals Ltd.',
        regulatoryInfo: 'FDA Approved: NDC 12345-678-90'
      },
      {
        type: 'vaccine',
        name: 'COVID-19 mRNA Vaccine',
        requiresColdChain: true,
        tempRange: { min: -25, max: -15 },
        shelfLife: 180,
        dosage: '0.3mL per dose',
        manufacturer: 'African Vaccine Initiative',
        regulatoryInfo: 'WHO EUL: VAC-2024-001'
      },
      {
        type: 'antibiotics',
        name: 'Amoxicillin 500mg Capsules',
        requiresColdChain: false,
        tempRange: { min: 15, max: 25 },
        shelfLife: 730,
        dosage: '500mg capsules',
        manufacturer: 'Heru Generic Medicines',
        regulatoryInfo: 'NAFDAC: A4-1234'
      },
      {
        type: 'biologics',
        name: 'Monoclonal Antibody Treatment',
        requiresColdChain: true,
        tempRange: { min: 2, max: 8 },
        shelfLife: 90,
        dosage: '100mg/vial',
        manufacturer: 'Heru Biologics Research',
        regulatoryInfo: 'EMA Authorization: EU/1/24/001'
      },
      {
        type: 'painkillers',
        name: 'Morphine Sulfate 10mg/mL',
        requiresColdChain: false,
        tempRange: { min: 20, max: 25 },
        shelfLife: 1095,
        dosage: '10mg/mL injection',
        manufacturer: 'Heru Pain Management',
        regulatoryInfo: 'Controlled Substance Schedule II'
      }
    ];

    templates.forEach(template => {
      this.medicineTemplates.set(template.type, template);
    });
  }

  /**
   * Initialize demo batches showing different stages of the supply chain
   */
  private initializeDemoBatches() {
    // Insulin batch - Currently in transport with good compliance
    this.createDemoBatch({
      batchNumber: 'INSULIN_2024_001',
      medicineType: 'insulin',
      stage: 'transport',
      hasViolations: false
    });

    // Vaccine batch - Just manufactured, pending transport
    this.createDemoBatch({
      batchNumber: 'VAC_COVID_2024_045',
      medicineType: 'vaccine',
      stage: 'manufacturing',
      hasViolations: false
    });

    // Antibiotics batch - At pharmacy, ready for dispensing
    this.createDemoBatch({
      batchNumber: 'AMOX_2024_789',
      medicineType: 'antibiotics',
      stage: 'pharmacy',
      hasViolations: false
    });

    // Biologics batch - In transport with temperature violations
    this.createDemoBatch({
      batchNumber: 'BIO_MAB_2024_012',
      medicineType: 'biologics',
      stage: 'transport',
      hasViolations: true
    });

    // Painkillers batch - Recently dispensed to hospital
    this.createDemoBatch({
      batchNumber: 'MORPH_2024_333',
      medicineType: 'painkillers',
      stage: 'dispensed',
      hasViolations: false
    });
  }

  /**
   * Create a demo batch with realistic data
   */
  private createDemoBatch(options: {
    batchNumber: string;
    medicineType: keyof typeof this.medicineTemplates;
    stage: BatchLifecycle['stage'];
    hasViolations: boolean;
  }) {
    const template = this.medicineTemplates.get(String(options.medicineType))!;
    const now = new Date();
    const manufacturingDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(manufacturingDate.getTime() + template.shelfLife * 24 * 60 * 60 * 1000);

    const batch: CompleteMedicineBatch = {
      batchNumber: options.batchNumber,
      medicine: template,
      manufacturingDate: manufacturingDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      quantity: Math.floor(Math.random() * 1000) + 100,
      lotNumber: `LOT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      
      // Blockchain identifiers (simulated)
      htsTokenId: `0.0.${Math.floor(Math.random() * 999999)}`,
      hcsTopicId: `0.0.${Math.floor(Math.random() * 999999)}`,
      guardianPolicyId: 'heru-medical-policy-v1.0',
      
      // Current status
      currentStage: options.stage,
      currentLocation: this.getLocationForStage(options.stage),
      lifecycle: this.generateLifecycleHistory(options.stage),
      
      // Quality control
      qualityTests: this.generateQualityTests(),
      
      // Cold chain data (if applicable)
      temperatureReadings: template.requiresColdChain ? 
        this.generateTemperatureReadings(template.tempRange, options.hasViolations) : [],
      
      // Verification
      qrCode: `heru://verify/${options.batchNumber}`,
      verificationUrl: `/verify/${options.batchNumber}`,
      isAuthentic: true,
      complianceStatus: options.hasViolations ? 'VIOLATION' : 'COMPLIANT',
      
      // Supply chain actors
      supplyChainActors: this.generateSupplyChainActors(options.stage)
    };

    this.activeBatches.set(options.batchNumber, batch);
  }

  /**
   * Get appropriate location based on supply chain stage
   */
  private getLocationForStage(stage: BatchLifecycle['stage']): string {
    const locations = {
      manufacturing: 'Heru Manufacturing Facility, Lagos, Nigeria',
      transport: 'Cold Chain Transport Vehicle EN-001',
      pharmacy: 'Central Pharmacy, Abuja, Nigeria',
      dispensed: 'National Hospital, Abuja, Nigeria',
      recalled: 'Quality Control Laboratory, Lagos, Nigeria'
    };
    return locations[stage];
  }

  /**
   * Generate realistic lifecycle history
   */
  private generateLifecycleHistory(currentStage: BatchLifecycle['stage']): BatchLifecycle[] {
    const stages: BatchLifecycle['stage'][] = ['manufacturing', 'transport', 'pharmacy', 'dispensed'];
    const currentIndex = stages.indexOf(currentStage);
    const history: BatchLifecycle[] = [];
    const now = new Date();

    for (let i = 0; i <= currentIndex; i++) {
      const stageDate = new Date(now.getTime() - (currentIndex - i) * 24 * 60 * 60 * 1000);
      history.push({
        stage: stages[i],
        timestamp: stageDate.toISOString(),
        location: this.getLocationForStage(stages[i]),
        actor: this.getActorForStage(stages[i]),
        notes: this.getNotesForStage(stages[i])
      });
    }

    return history;
  }

  private getActorForStage(stage: BatchLifecycle['stage']): string {
    const actors = {
      manufacturing: 'Dr. Adebayo Okonkwo (Production Manager)',
      transport: 'ColdChain Logistics Ltd.',
      pharmacy: 'Pharm. Sarah Okafor (Chief Pharmacist)',
      dispensed: 'Dr. Ibrahim Musa (Attending Physician)',
      recalled: 'NAFDAC Quality Assurance Team'
    };
    return actors[stage];
  }

  private getNotesForStage(stage: BatchLifecycle['stage']): string {
    const notes = {
      manufacturing: 'Quality control tests passed. GMP compliance verified.',
      transport: 'Cold chain maintained. GPS tracking active.',
      pharmacy: 'Batch received and stored according to protocol.',
      dispensed: 'Dispensed to patient under medical supervision.',
      recalled: 'Precautionary recall due to quality concerns.'
    };
    return notes[stage];
  }

  /**
   * Generate quality test results
   */
  private generateQualityTests() {
    return [
      {
        testType: 'Potency Assay',
        result: 'PASS' as const,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Active ingredient concentration: 99.8%'
      },
      {
        testType: 'Sterility Test',
        result: 'PASS' as const,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'No microbial contamination detected'
      },
      {
        testType: 'Endotoxin Test',
        result: 'PASS' as const,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Endotoxin level: <0.5 EU/mL'
      }
    ];
  }

  /**
   * Generate temperature readings for cold chain medicines
   */
  private generateTemperatureReadings(tempRange: { min: number; max: number }, hasViolations: boolean) {
    const readings = [];
    const now = Date.now();
    const hoursBack = 48; // Last 48 hours
    
    for (let i = 0; i < hoursBack; i++) {
      const timestamp = new Date(now - i * 60 * 60 * 1000);
      let temperature: number;
      
      if (hasViolations && i < 8) {
        // Recent violations
        temperature = tempRange.max + Math.random() * 5;
      } else {
        // Normal range with some variation
        temperature = tempRange.min + Math.random() * (tempRange.max - tempRange.min);
      }
      
      readings.push({
        timestamp: timestamp.toISOString(),
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round((45 + Math.random() * 20) * 10) / 10,
        location: `GPS: ${(6.5 + Math.random() * 0.1).toFixed(6)}, ${(3.3 + Math.random() * 0.1).toFixed(6)}`,
        isCompliant: temperature >= tempRange.min && temperature <= tempRange.max
      });
    }
    
    return readings.reverse(); // Chronological order
  }

  /**
   * Generate supply chain actors involved in the batch
   */
  private generateSupplyChainActors(stage: BatchLifecycle['stage']) {
    const baseActors: Array<{
      role: 'manufacturer' | 'transporter' | 'pharmacy' | 'hospital' | 'regulator';
      name: string;
      did?: string;
      timestamp: string;
      action: string;
    }> = [
      {
        role: 'manufacturer',
        name: 'Heru Pharmaceuticals Ltd.',
        did: 'did:hedera:testnet:manufacturer-001',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Manufacturing and quality control'
      },
      {
        role: 'regulator',
        name: 'NAFDAC',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Regulatory approval and compliance verification'
      }
    ];

    if (['transport', 'pharmacy', 'dispensed'].includes(stage)) {
      baseActors.push({
        role: 'transporter',
        name: 'ColdChain Logistics Ltd.',
        did: 'did:hedera:testnet:transporter-001',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Temperature-controlled transport'
      });
    }

    if (['pharmacy', 'dispensed'].includes(stage)) {
      baseActors.push({
        role: 'pharmacy',
        name: 'Central Pharmacy Abuja',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Storage and inventory management'
      });
    }

    if (stage === 'dispensed') {
      baseActors.push({
        role: 'hospital',
        name: 'National Hospital Abuja',
        timestamp: new Date().toISOString(),
        action: 'Patient administration'
      });
    }

    return baseActors;
  }

  /**
   * STEP 1: Start manufacturing a new medicine batch
   */
  async startManufacturing(medicineType: string, quantity: number): Promise<string> {
    const template = this.medicineTemplates.get(medicineType);
    if (!template) {
      throw new Error(`Unknown medicine type: ${medicineType}`);
    }

    const batchNumber = `${medicineType.toUpperCase()}_${new Date().getFullYear()}_${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
    
    console.log(`🏭 Starting manufacturing of batch ${batchNumber}...`);
    
    // Create HTS NFT for the batch
    const htsTokenId = await hederaNativeService.createMedicineBatchNFT({
      id: batchNumber,
      medicine: template.name,
      batchNumber,
      quantity: quantity.toString(),
      manufacturer: template.manufacturer,
      destination: 'TBD',
      tempMin: template.tempRange.min,
      tempMax: template.tempRange.max,
      guardianName: 'NAFDAC Inspector',
      guardianContact: 'inspector@nafdac.gov.ng',
      timestamp: new Date().toISOString(),
      medicineType: template.type === 'painkillers' ? 'other' : template.type,
      expiryDate: new Date(Date.now() + template.shelfLife * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manufacturingDate: new Date().toISOString().split('T')[0]
    });

    console.log(`✅ Manufacturing complete! HTS Token: ${htsTokenId}`);
    return batchNumber;
  }

  /**
   * STEP 2: Begin cold chain transport
   */
  async startTransport(batchNumber: string, destination: string): Promise<void> {
    const batch = this.activeBatches.get(batchNumber);
    if (!batch) {
      throw new Error(`Batch not found: ${batchNumber}`);
    }

    console.log(`🚚 Starting transport of batch ${batchNumber} to ${destination}...`);

    // Create HCS topic for temperature monitoring
    const hcsTopicId = await hederaNativeService.createTemperatureDataTopic(batchNumber);

    // Update batch status
    batch.currentStage = 'transport';
    batch.currentLocation = `En route to ${destination}`;
    batch.hcsTopicId = hcsTopicId;

    // Start temperature monitoring (simulated)
    this.simulateTemperatureMonitoring(batch);

    console.log(`✅ Transport started! HCS Topic: ${hcsTopicId}`);
  }

  /**
   * STEP 3: Simulate real-time temperature monitoring
   */
  private simulateTemperatureMonitoring(batch: CompleteMedicineBatch) {
    if (!batch.medicine.requiresColdChain) return;

    const interval = setInterval(async () => {
      const temp = batch.medicine.tempRange.min + 
                  Math.random() * (batch.medicine.tempRange.max - batch.medicine.tempRange.min);
      
      const reading = {
        batchId: batch.batchNumber,
        temperature: Math.round(temp * 10) / 10,
        humidity: Math.round((50 + Math.random() * 20) * 10) / 10,
        location: `GPS: ${(6.5 + Math.random() * 0.1).toFixed(6)}, ${(3.3 + Math.random() * 0.1).toFixed(6)}`,
        timestamp: new Date().toISOString(),
        sensorId: 'TEMP-001',
        complianceStatus: (temp >= batch.medicine.tempRange.min && temp <= batch.medicine.tempRange.max) ? 'compliant' as const : 'critical' as const
      };

      // Log to Hedera HCS
      await hederaNativeService.logTemperatureReading(reading);

      // Update batch data
      batch.temperatureReadings.push({
        timestamp: reading.timestamp,
        temperature: reading.temperature,
        humidity: reading.humidity,
        location: reading.location,
        isCompliant: reading.complianceStatus === 'compliant'
      });

      // Stop simulation after 10 readings (demo purpose)
      if (batch.temperatureReadings.length > 10) {
        clearInterval(interval);
      }
    }, 5000); // Every 5 seconds for demo
  }

  /**
   * STEP 4: Verify batch authenticity via QR code
   */
  async verifyBatch(batchNumber: string): Promise<any> {
    const batch = this.activeBatches.get(batchNumber);
    if (!batch) {
      return { error: 'Batch not found', isValid: false };
    }

    console.log(`🔍 Verifying batch ${batchNumber}...`);

    // Get blockchain verification
    const blockchainData = await hederaNativeService.verifyMedicineBatch(batchNumber);

    return {
      ...blockchainData,
      batchDetails: batch,
      verificationTime: new Date().toISOString(),
      message: `✅ Batch ${batchNumber} is authentic and ${batch.complianceStatus.toLowerCase()}`
    };
  }

  /**
   * Get all active batches
   */
  getAllBatches(): CompleteMedicineBatch[] {
    return Array.from(this.activeBatches.values());
  }

  /**
   * Get specific batch details
   */
  getBatch(batchNumber: string): CompleteMedicineBatch | undefined {
    return this.activeBatches.get(batchNumber);
  }

  /**
   * Get medicine templates
   */
  getMedicineTemplates(): MedicineTemplate[] {
    return Array.from(this.medicineTemplates.values());
  }

  /**
   * Get batches by stage
   */
  getBatchesByStage(stage: BatchLifecycle['stage']): CompleteMedicineBatch[] {
    return Array.from(this.activeBatches.values()).filter(batch => batch.currentStage === stage);
  }

  /**
   * Get compliance statistics
   */
  getComplianceStats() {
    const batches = this.getAllBatches();
    const total = batches.length;
    const compliant = batches.filter(b => b.complianceStatus === 'COMPLIANT').length;
    const violations = batches.filter(b => b.complianceStatus === 'VIOLATION').length;
    const critical = batches.filter(b => b.complianceStatus === 'CRITICAL').length;

    return {
      total,
      compliant,
      violations,
      critical,
      complianceRate: Math.round((compliant / total) * 100)
    };
  }
}

// Export singleton
export const medicineBatchFlowService = new MedicineBatchFlowService();
export default medicineBatchFlowService;