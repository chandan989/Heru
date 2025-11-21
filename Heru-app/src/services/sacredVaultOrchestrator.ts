import { hederaService } from './hederaService';
import { ipfsService } from './ipfsService';
import { batchRegistryService, BatchRecord } from './batchRegistryService';
import { issueGuardianCredential } from './guardianIntegrationService';
import { computeSha256Hex } from './hashUtils';
import { databaseService } from './databaseService';
import { heruContractService } from './heruContractService';

// Public schema version for batch metadata
export const METADATA_SCHEMA_VERSION = '1.0.0';

export interface CreateBatchInput {
  batchNumber: string;
  medicine: string;
  quantity: string;
  manufacturer: string;
  destination: string;
  tempMin: number;
  tempMax: number;
  expiryDate?: string;
  medicineType?: 'vaccine' | 'insulin' | 'antibiotics' | 'biologics' | 'other';
  guardianName?: string;
  guardianContact?: string;
  manufacturingDate?: string;
  regulatoryApproval?: string;
  carbonFootprintKg?: number;
  // Additional custom fields can be extended here
  rawForm?: any; // preserve original form if needed
}

export interface DocumentHashMap {
  [key: string]: string | undefined;
}

export interface CreateBatchResult {
  record: BatchRecord;
  tokenId: string | null;
  fileReference?: { type: 'HFS' | 'IPFS' | 'MOCK'; ref: string } | null;
  sha256?: string;
  simulated: boolean;
  contractTransactionId?: string; // Smart contract transaction ID
  contractShipmentCreated?: boolean; // Whether shipment was created on contract
}

/**
 * Hybrid flow orchestrator (NFT first, then metadata) without UI coupling.
 */
export async function createBatchSeal(input: CreateBatchInput, documentHashes: DocumentHashMap) : Promise<CreateBatchResult> {
  // 1. Ensure Hedera service initialized (allow demo mode)
  await hederaService.initialize();

  // 2. Build temporary batchData object compatible with existing token creation API
  const nowIso = new Date().toISOString();
  const batchData: any = {
    id: input.batchNumber,
    medicine: input.medicine,
    batchNumber: input.batchNumber,
    quantity: input.quantity,
    manufacturer: input.manufacturer,
    destination: input.destination,
    tempMin: input.tempMin,
    tempMax: input.tempMax,
    guardianName: input.guardianName || 'n/a',
    guardianContact: input.guardianContact || 'n/a',
    timestamp: nowIso,
    medicineType: input.medicineType || 'other',
    expiryDate: input.expiryDate || 'unknown',
    manufacturingDate: input.manufacturingDate || nowIso.substring(0,10),
    gtin: 'NA',
    regulatoryApproval: input.regulatoryApproval || 'pending',
    carbonFootprint: input.carbonFootprintKg || 0,
    supplychainStakeholders: {
      manufacturer: { name: input.manufacturer, location: input.manufacturer, certification: 'pending' },
      guardian: { name: input.guardianName || 'n/a', contact: input.guardianContact || 'n/a', certification: 'n/a' },
      destination: { facility: input.destination, location: input.destination, license: 'pending' }
    },
    qualityAssurance: { batchTestResults: [], certifications: [], inspectionDate: nowIso.substring(0,10) },
    esgscore: { environmental: 0, social: 0, governance: 0 }
  };

  // 3. Create token (or mock) via existing service
  const tokenId = await hederaService.createMedicineBatchToken(batchData);
  const simulated = tokenId.startsWith('0.0.') === false && tokenId.includes('SIM-'); // heuristic if we change format later

  // 4. Build metadata object including tokenId & schema version
  const metadata = {
    schema_version: METADATA_SCHEMA_VERSION,
    batchNumber: input.batchNumber,
    tokenId,
    medicine: input.medicine,
    quantity: input.quantity,
    manufacturer: input.manufacturer,
    destination: input.destination,
    temperature: { min: input.tempMin, max: input.tempMax },
    expiryDate: input.expiryDate || null,
    medicineType: input.medicineType || 'other',
    guardian: { name: input.guardianName || null, contact: input.guardianContact || null },
    documents: documentHashes,
    createdAt: nowIso,
    storage: { strategy: 'dynamic_hfs_ipfs', priority: 'HFS_first_then_IPFS_fallback' }
  };

  // 5. Compute hash BEFORE storage for integrity
  const jsonPretty = JSON.stringify(metadata, null, 2);
  const sha256 = await computeSha256Hex(jsonPretty);

  // 6. Store metadata using existing ipfsService (which may route to HFS)
  const storageRes = await ipfsService.uploadBatchMetadata(metadata, documentHashes as any);
  // NOTE: existing uploadBatchMetadata expects batchData-like object; we overloaded by passing metadata.
  // If this causes shape mismatch later we can introduce a dedicated storeMetadata function.

  // Detect storage type from hash prefix
  let fileReference: { type: 'HFS' | 'IPFS' | 'MOCK'; ref: string } | null = null;
  if (storageRes.hash.startsWith('HFS:')) {
    fileReference = { type: 'HFS', ref: storageRes.hash.replace('HFS:', '') };
  } else if (storageRes.hash.startsWith('Qm')) {
    fileReference = { type: 'IPFS', ref: storageRes.hash };
  } else {
    fileReference = { type: 'MOCK', ref: storageRes.hash };
  }

  // File storage completed

  // 7. Persist initial batch record (guardian pending if enabled later)
  let record = batchRegistryService.add({
    batchNumber: input.batchNumber,
    medicine: input.medicine,
    tokenId,
    simulated,
    schemaVersion: METADATA_SCHEMA_VERSION,
    metadata: { fileRef: fileReference, sha256, sizeBytes: storageRes.size },
    status: 'created',
    guardian: { status: 'pending' }
  });

  // Batch record created

  // 8. Guardian credential issuance (soft-fail). We treat disabled separately.
  try {
    const guardianResult = await issueGuardianCredential(metadata, sha256);
    record = batchRegistryService.update(record.id, {
      guardian: {
        status: guardianResult.status,
        vcId: guardianResult.vcId,
        vcHash: guardianResult.vcHash,
        errors: guardianResult.errors,
        policyId: guardianResult.policyId
      }
    }) || record;

    // Guardian VC processing completed
  } catch (e: any) {
    record = batchRegistryService.update(record.id, {
      guardian: { status: 'failed', errors: [e?.message || 'guardian issuance error'] }
    }) || record;
  }

  // 9. Create HCS Topic and submit initial message
  let hcsTopicId: string | null = null;
  let hcsTransactionId: string | null = null;
  
  try {
    // Create HCS topic for this batch
    hcsTopicId = await hederaService.createHCSTopic(input.batchNumber);
    
    if (hcsTopicId) {
      // Submit initial batch creation message
      const initialMessage = {
        eventType: 'BATCH_CREATED',
        batchNumber: input.batchNumber,
        medicine: input.medicine,
        manufacturer: input.manufacturer,
        quantity: input.quantity,
        tokenId: tokenId,
        ipfsHash: fileReference?.ref,
        guardianStatus: record.guardian?.status,
        timestamp: nowIso,
        compliance: {
          temperatureRange: `${input.tempMin}°C to ${input.tempMax}°C`,
          isCompliant: true,
          notes: 'Initial batch creation - all parameters within specification'
        }
      };
      
      hcsTransactionId = await hederaService.submitHCSMessage(hcsTopicId, initialMessage, record.id);
    }
  } catch (hcsError) {
    console.warn('⚠️ HCS operations failed:', hcsError);
    // Don't fail the entire operation for HCS issues
  }

  // 9b. SMART CONTRACT INTEGRATION - Create shipment with escrow
  let contractTransactionId: string | undefined;
  let contractShipmentCreated = false;
  
  try {
    // Initialize contract service
    const contractReady = await heruContractService.initialize();
    
    if (contractReady && hcsTopicId && tokenId) {
      console.log('🔗 Creating shipment on smart contract...');
      
      // Get operator address as distributor for demo (in production, this would be actual distributor)
      const operatorAddress = import.meta.env.VITE_HEDERA_ACCOUNT_ID?.replace('0.0.', '0x') || '0x0000000000000000000000000000000000000000';
      
      contractTransactionId = await heruContractService.createShipment({
        batchId: input.batchNumber,
        distributorAddress: operatorAddress,
        htsTokenId: tokenId,
        hcsTopicId: hcsTopicId,
        escrowAmount: 10 // 10 HBAR escrow
      });
      
      contractShipmentCreated = true;
      console.log('✅ Shipment created on smart contract!');
      console.log(`   Transaction: ${contractTransactionId}`);
      console.log(`   Escrow: 10 HBAR locked in contract`);
    } else {
      console.log('⚠️ Smart contract not used - missing prerequisites or credentials');
    }
  } catch (contractError) {
    console.warn('⚠️ Smart contract shipment creation failed:', contractError);
    // Don't fail the entire operation for contract issues
  }

  // 10. Save to database for UI display
  try {
    const dbRecord = {
      id: record.id,
      batch_number: input.batchNumber,
      medicine: input.medicine,
      manufacturer: input.manufacturer,
      quantity: parseInt(input.quantity) || 0,
      
      // Blockchain data
      hts_token_id: tokenId || undefined,
      hcs_topic_id: hcsTopicId || undefined,
      transaction_id: hcsTransactionId || contractTransactionId || undefined,
      contract_address: contractShipmentCreated ? '0.0.6904249' : undefined,
      
      // Guardian data
      guardian_policy_id: record.guardian?.policyId,
      verifiable_credential_id: record.guardian?.vcId,
      vc_hash: record.guardian?.vcHash,
      
      // IPFS data
      ipfs_hash: fileReference?.type === 'IPFS' ? fileReference.ref : undefined,
      metadata_uri: fileReference ? `${fileReference.type}:${fileReference.ref}` : undefined,
      
      // Batch details
      medicine_type: input.medicineType || 'other',
      expiry_date: input.expiryDate,
      manufacturing_date: input.manufacturingDate || nowIso.split('T')[0],
      temp_min: input.tempMin,
      temp_max: input.tempMax,
      
      // Status
      status: 'created' as const,
      created_at: nowIso,
      updated_at: nowIso,
      
      // Compliance
      is_compliant: true, // Default to compliant, will be updated by temperature monitoring
      compliance_notes: undefined
    };
    
    await databaseService.saveBatch(dbRecord);
    console.log('✅ Batch saved to database with HCS data:', record.id);
  } catch (dbError) {
    console.warn('⚠️ Failed to save batch to database:', dbError);
    // Don't fail the entire operation for database issues
  }

  return { 
    record, 
    tokenId, 
    fileReference, 
    sha256, 
    simulated,
    contractTransactionId,
    contractShipmentCreated
  };
}
