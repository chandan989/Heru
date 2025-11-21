/**
 * Internal UUID generator.
 * Removed external 'uuid' package to avoid resolution error in environments where it isn't installed.
 * Order of preference: crypto.randomUUID (modern browsers) -> Math.random fallback pattern.
 */
function generateUuid() {
  try {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID();
    }
  } catch {}
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface BatchRecord {
  id: string;                // internal id (uuid)
  batchNumber: string;       // human batch number
  medicine: string;
  tokenId: string | null;    // full token id or simulated id
  simulated: boolean;        // true if not actually minted
  schemaVersion: string;     // metadata schema version
  metadata: {
    fileRef: { type: 'HFS' | 'IPFS' | 'MOCK'; ref: string } | null;
    sha256?: string;
    sizeBytes?: number;
  };
  createdAt: string;
  status: 'created' | 'anchoring' | 'anchored' | 'failed';
  anchor?: {
    topicId: string;
    consensusTimestamp: string;
    sequenceNumber: number;
  };
  guardian?: {
    status: 'pending' | 'issued' | 'failed' | 'disabled';
    vcId?: string;
    vcHash?: string; // hash of VC / credential for anchoring
    anchoredTimestamp?: string; // when vcHash anchored (future)
    errors?: string[];
    policyId?: string;
  };
  errors?: { stage: string; message: string }[];
}

const STORAGE_KEY = 'heru_batches_v1';

class BatchRegistryService {
  private batches: BatchRecord[] = [];
  private loaded = false;

  private load() {
    if (this.loaded) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.batches = JSON.parse(raw);
    } catch (e) {
      console.warn('[batchRegistry] failed to load', e);
    }
    this.loaded = true;
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.batches));
    } catch (e) {
      console.warn('[batchRegistry] failed to persist', e);
    }
  }

  list(): BatchRecord[] {
    this.load();
    return [...this.batches];
  }

  get(id: string): BatchRecord | undefined {
    this.load();
    return this.batches.find(b => b.id === id);
  }

  findByBatchNumber(batchNumber: string): BatchRecord | undefined {
    this.load();
    return this.batches.find(b => b.batchNumber === batchNumber);
  }

  add(partial: Omit<BatchRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): BatchRecord {
    this.load();
  const id = partial.id || generateUuid();
    const record: BatchRecord = {
      ...partial,
      id,
      createdAt: partial.createdAt || new Date().toISOString()
    };
    this.batches.push(record);
    this.persist();
    return record;
  }

  update(id: string, patch: Partial<BatchRecord>): BatchRecord | undefined {
    this.load();
    const idx = this.batches.findIndex(b => b.id === id);
    if (idx === -1) return undefined;
    this.batches[idx] = { ...this.batches[idx], ...patch };
    this.persist();
    return this.batches[idx];
  }

  remove(id: string) {
    this.load();
    const before = this.batches.length;
    this.batches = this.batches.filter(b => b.id !== id);
    if (this.batches.length !== before) this.persist();
  }

  clearAll() {
    this.batches = [];
    this.persist();
  }
}

export const batchRegistryService = new BatchRegistryService();
export default batchRegistryService;
