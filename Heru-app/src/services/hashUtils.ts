// Simple SHA-256 helper returning hex string
export async function computeSha256Hex(input: string | Uint8Array): Promise<string> {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  // Ensure we pass a proper ArrayBuffer (some TS libs are strict about BufferSource)
  const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as ArrayBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Deterministic canonical JSON serializer: recursively sorts object keys.
 * Ensures consistent hashing across environments.
 */
export function canonicalJson(value: any): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: any): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(v => canonicalize(v));
  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    Object.keys(value).sort().forEach(k => {
      const v = (value as any)[k];
      if (v === undefined) return; // skip undefined for stability
      out[k] = canonicalize(v);
    });
    return out;
  }
  return value;
}

/**
 * Convenience: compute canonical SHA-256 hash of a JSON structure.
 */
export async function hashCanonicalJson(obj: any): Promise<string> {
  return computeSha256Hex(canonicalJson(obj));
}
