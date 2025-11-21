import { Client, FileCreateTransaction, FileAppendTransaction, Hbar } from '@hashgraph/sdk';

/**
 * Hedera File Service (HFS) helper
 * Provides basic JSON/file upload with chunking and simple retrieval hints.
 */
export interface HfsUploadResult {
  fileId: string;
  size: number;
  chunks: number;
  sha256?: string; // caller can supply precomputed hash
}

const MAX_CHUNK = 4000; // bytes (SDK limit for initial content recommended small)

class HfsService {
  private client: Client | null = null;
  private ready = false;

  /** Provide an existing initialized Client (with operator set). */
  setClient(client: Client) {
    this.client = client;
    this.ready = true;
  }

  isReady() { return this.ready && !!this.client; }

  /** Upload raw bytes to HFS (auto chunk). */
  async uploadBytes(bytes: Uint8Array, options: { memo?: string; sha256?: string } = {}): Promise<HfsUploadResult> {
    if (!this.client) throw new Error('HFS client not set');

    const first = bytes.slice(0, MAX_CHUNK);
    const createTx = await new FileCreateTransaction()
      .setContents(first)
      .setFileMemo(options.memo?.slice(0, 100) || 'Heru HFS File')
      .setMaxTransactionFee(new Hbar(2))
      .execute(this.client);

    const receipt = await createTx.getReceipt(this.client);
    const fileId = receipt.fileId!.toString();

    let offset = MAX_CHUNK;
    let chunks = 1;
    while (offset < bytes.length) {
      const chunk = bytes.slice(offset, offset + MAX_CHUNK);
      const appendTx = await new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(chunk)
        .setMaxTransactionFee(new Hbar(2))
        .execute(this.client);
      await appendTx.getReceipt(this.client);
      offset += MAX_CHUNK;
      chunks++;
    }

    return { fileId, size: bytes.length, chunks, sha256: options.sha256 };
  }

  /** Convenience: upload JSON object. */
  async uploadJson(obj: any, options: { memo?: string; sha256?: string } = {}): Promise<HfsUploadResult> {
    const json = JSON.stringify(obj, null, 2);
    return this.uploadBytes(new TextEncoder().encode(json), { memo: options.memo, sha256: options.sha256 });
  }
}

export const hfsService = new HfsService();
export default hfsService;
