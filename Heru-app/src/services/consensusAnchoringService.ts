import { batchRegistryService, BatchRecord } from './batchRegistryService';
import { hederaService } from './hederaService';

export interface AnchorPublishResult {
  success: boolean;
  error?: string;
  updatedRecord?: BatchRecord;
  transactionId?: string;
}

// Shape of anchor message (keep minimal for cost & speed)
interface AnchorMessage {
  t: 'batch_meta_v1';
  batch: string; // batchNumber
  tokenId: string | null;
  file?: { type: string; ref: string } | null;
  sha256?: string;
  schema?: string;
  ts: string; // client timestamp
}

/**
 * Publish a consensus anchor for a batch's metadata hash & file reference.
 * Idempotent: if batch already anchored (has anchor object) returns early.
 */
export async function publishBatchAnchor(batchIdOrNumber: string): Promise<AnchorPublishResult> {
  try {
    // Locate batch by id or batchNumber
    let record = batchRegistryService.get(batchIdOrNumber) || batchRegistryService.findByBatchNumber(batchIdOrNumber);
    if (!record) {
      return { success: false, error: 'Batch not found' };
    }
    if (record.anchor) {
      return { success: true, updatedRecord: record }; // already anchored
    }

    // Build minimal message
    const msg: AnchorMessage = {
      t: 'batch_meta_v1',
      batch: record.batchNumber,
      tokenId: record.tokenId,
      file: record.metadata.fileRef ? { type: record.metadata.fileRef.type, ref: record.metadata.fileRef.ref } : null,
      sha256: record.metadata.sha256,
      schema: record.schemaVersion,
      ts: new Date().toISOString()
    };

    // Submit via hederaService consensus method (will fallback to mock if not configured)
    const txId = await hederaService.submitToConsensusService('BATCH_METADATA_ANCHOR', msg);

    // We don't (yet) have sequenceNumber or consensusTimestamp from mirror node directly here.
    // Store minimal anchor placeholder; a future verification service can enrich.
    record = batchRegistryService.update(record.id, {
      status: 'anchored',
      anchor: {
        topicId: (hederaService as any).consensusTopicId || 'unknown',
        consensusTimestamp: new Date().toISOString(), // placeholder until mirror node lookup
        sequenceNumber: -1 // unknown until retrieval
      }
    })!;

    return { success: true, updatedRecord: record, transactionId: txId };
  } catch (e: any) {
    return { success: false, error: e?.message || String(e) };
  }
}

/**
 * Convenience: anchor all unanchored batches.
 */
export async function anchorAllUnanchored(): Promise<AnchorPublishResult[]> {
  const results: AnchorPublishResult[] = [];
  for (const b of batchRegistryService.list()) {
    if (!b.anchor) {
      results.push(await publishBatchAnchor(b.id));
    }
  }
  return results;
}
