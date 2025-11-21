import { batchRegistryService, BatchRecord } from './batchRegistryService';
import { hederaService } from './hederaService';
import { ipfsService } from './ipfsService';
import { mirrorNodeService } from './mirrorNodeService';

interface VerificationSummary {
  batchId: string;              // internal registry id
  batchNumber: string;
  tokenId: string | null;
  simulated: boolean;
  fileRef?: { type: string; ref: string } | null;
  storedSha256?: string;        // hash stored in registry
  recomputedSha256?: string;    // hash recomputed from retrieved metadata
  hashMatches: boolean | null;  // null if could not recompute
  anchorFound: boolean;         // anchor record exists in registry
  anchorMessageLocated: boolean;// located on mirror node topic messages
  anchorSequenceNumber?: number;
  consensusTimestamp?: string;
  mirrorTopicId?: string;
  metadataRetrieval: 'ok' | 'not-found' | 'error';
  metadataSizeBytes?: number;
  errors: string[];
  status: 'valid' | 'mismatch' | 'partial' | 'unanchored' | 'error';
}

// Lightweight sha256 hex (duplicate logic avoided by dynamic import of hashUtils)
async function sha256Hex(str: string): Promise<string> {
  const enc = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fetchMetadataFile(fileRef: { type: string; ref: string }) : Promise<{ text: string; size: number } | null> {
  try {
    if (fileRef.type === 'HFS') {
      // Mirror node file content endpoint
      const url = `https://testnet.mirrornode.hedera.com/api/v1/files/${fileRef.ref}/contents`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const text = await res.text();
      return { text, size: text.length };
    }
    if (fileRef.type === 'IPFS') {
      const blob = await ipfsService.getFile(fileRef.ref);
      const text = await blob.text();
      return { text, size: blob.size };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function locateAnchorMessage(batch: BatchRecord): Promise<{ found: boolean; sequence?: number; consensusTimestamp?: string; topicId?: string }> {
  try {
    const topicId = (hederaService as any).consensusTopicId || batch.anchor?.topicId;
    if (!topicId) return { found: false };
    const messages = await mirrorNodeService.getTopicMessages(topicId);
    // Our anchor messages have t == 'batch_meta_v1'
    for (const m of messages) {
      try {
        const parsed = JSON.parse(m.message);
        if (parsed.t === 'batch_meta_v1' && parsed.batch === batch.batchNumber) {
          return { found: true, sequence: m.sequenceNumber, consensusTimestamp: m.consensusTimestamp, topicId };
        }
      } catch {}
    }
    return { found: false, topicId };
  } catch (e) {
    return { found: false };
  }
}

export async function verifyBatchIntegrity(batchIdOrNumber: string): Promise<VerificationSummary> {
  const errors: string[] = [];
  let record = batchRegistryService.get(batchIdOrNumber) || batchRegistryService.findByBatchNumber(batchIdOrNumber);
  if (!record) {
    return {
      batchId: batchIdOrNumber,
      batchNumber: batchIdOrNumber,
      tokenId: null,
      simulated: false,
      errors: ['Batch not found'],
      anchorFound: false,
      anchorMessageLocated: false,
      hashMatches: null,
      metadataRetrieval: 'not-found',
      status: 'error'
    } as VerificationSummary;
  }

  const summary: VerificationSummary = {
    batchId: record.id,
    batchNumber: record.batchNumber,
    tokenId: record.tokenId,
    simulated: record.simulated,
    fileRef: record.metadata.fileRef,
    storedSha256: record.metadata.sha256,
    recomputedSha256: undefined,
    hashMatches: null,
    anchorFound: !!record.anchor,
    anchorMessageLocated: false,
    metadataRetrieval: 'not-found',
    errors,
    status: 'partial'
  };

  // 1. Retrieve metadata & recompute hash
  if (record.metadata.fileRef) {
    const meta = await fetchMetadataFile(record.metadata.fileRef);
    if (meta) {
      summary.metadataRetrieval = 'ok';
      summary.metadataSizeBytes = meta.size;
      try {
        // Attempt recompute only if JSON
        const recomputed = await sha256Hex(meta.text);
        summary.recomputedSha256 = recomputed;
        if (record.metadata.sha256) {
          summary.hashMatches = (recomputed === record.metadata.sha256);
        } else {
          summary.hashMatches = null;
        }
      } catch (e:any) {
        errors.push('Failed to recompute hash');
        summary.metadataRetrieval = 'error';
      }
    } else {
      summary.metadataRetrieval = 'not-found';
      errors.push('Metadata file not retrievable');
    }
  }

  // 2. Locate anchor message on topic (if any anchor expected or hash present)
  if (record.metadata.sha256) {
    const anchorLookup = await locateAnchorMessage(record);
    summary.anchorMessageLocated = anchorLookup.found;
    if (anchorLookup.found) {
      summary.anchorSequenceNumber = anchorLookup.sequence;
      summary.consensusTimestamp = anchorLookup.consensusTimestamp;
      summary.mirrorTopicId = anchorLookup.topicId;
    }
  }

  // 3. Determine status
  if (errors.length) {
    summary.status = 'error';
  } else if (!record.metadata.sha256) {
    summary.status = 'partial';
  } else if (!summary.anchorMessageLocated) {
    summary.status = 'unanchored';
  } else if (summary.hashMatches === false) {
    summary.status = 'mismatch';
  } else if (summary.hashMatches === true && summary.anchorMessageLocated) {
    summary.status = 'valid';
  } else {
    summary.status = 'partial';
  }

  return summary;
}

export async function verifyAllBatches(): Promise<VerificationSummary[]> {
  const list = batchRegistryService.list();
  const results: VerificationSummary[] = [];
  for (const b of list) {
    results.push(await verifyBatchIntegrity(b.id));
  }
  return results;
}

export type { VerificationSummary };
