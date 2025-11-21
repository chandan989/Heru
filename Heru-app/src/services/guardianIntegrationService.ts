/**
 * Guardian Integration Service - Real external submission + polling
 * Falls back gracefully to simulation; never blocks batch creation.
 */
import { computeSha256Hex, hashCanonicalJson } from './hashUtils';

interface GuardianEnvConfig {
  enabled: boolean;
  anchor: boolean;
  mode: 'real' | 'simulate';
  apiUrl?: string;
  apiKey?: string;
  policyId?: string;
  jwt?: string;
  username?: string;
  password?: string;
  blockTag?: string;
  pollIntervalMs: number;
  pollMaxAttempts: number;
}

export interface GuardianIssuanceResult {
  status: 'issued' | 'failed' | 'disabled' | 'pending';
  vcId?: string;
  vcHash?: string;
  errors?: string[];
  policyId?: string;
  mode?: 'real' | 'simulate';
  attempts?: number;
}

function loadEnv(): GuardianEnvConfig {
  const apiUrl = import.meta.env.VITE_GUARDIAN_API_URL as string | undefined;
  const apiKey = import.meta.env.VITE_GUARDIAN_API_KEY as string | undefined;
  const policyId = import.meta.env.VITE_GUARDIAN_POLICY_ID as string | undefined;
  const modeRaw = (import.meta.env.VITE_GUARDIAN_MODE as string | undefined)?.toLowerCase();
  const mode: 'real' | 'simulate' = modeRaw === 'real' ? 'real' : 'simulate';
  const explicitAnchor = import.meta.env.VITE_GUARDIAN_ANCHOR;
  const jwt = import.meta.env.VITE_GUARDIAN_JWT as string | undefined;
  const username = import.meta.env.VITE_GUARDIAN_USERNAME as string | undefined;
  const password = import.meta.env.VITE_GUARDIAN_PASSWORD as string | undefined;
  const blockTag = (import.meta.env.VITE_GUARDIAN_BLOCK_TAG as string | undefined) || 'batchInput';
  const enabled = mode === 'simulate' ? true : !!(apiUrl && policyId && blockTag && (jwt || (username && password)));
  const anchor = explicitAnchor === 'true';
  const pollIntervalMs = parseInt(import.meta.env.VITE_GUARDIAN_POLL_INTERVAL_MS || '2000', 10);
  const pollMaxAttempts = parseInt(import.meta.env.VITE_GUARDIAN_POLL_MAX_ATTEMPTS || '10', 10);
  return { enabled, anchor, apiUrl, apiKey, policyId, mode, jwt, username, password, blockTag, pollIntervalMs, pollMaxAttempts };
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function loginToGuardian(cfg: GuardianEnvConfig): Promise<string | undefined> {
  if (!cfg.username || !cfg.password) return undefined;
  try {
    const loginRes = await fetchJson(`${cfg.apiUrl}/accounts/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cfg.username, password: cfg.password })
    });
    
    // Try to get access token
    const tokenRes = await fetchJson(`${cfg.apiUrl}/accounts/access-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    return tokenRes?.accessToken || loginRes?.accessToken;
  } catch (e) {
    return undefined;
  }
}

function buildHeaders(cfg: GuardianEnvConfig, accessToken?: string): Record<string,string> {
  const h: Record<string,string> = { 'Content-Type': 'application/json' };
  if (accessToken) h['Authorization'] = `Bearer ${accessToken}`;
  else if (cfg.jwt) h['Authorization'] = `Bearer ${cfg.jwt}`;
  else if (cfg.apiKey) h['x-api-key'] = cfg.apiKey;
  return h;
}

async function fetchJson(url: string, opts: RequestInit): Promise<any> {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; } catch { return {}; }
}

async function submitExternal(cfg: GuardianEnvConfig, payload: any, errors: string[]): Promise<void> {
  try {
    const accessToken = await loginToGuardian(cfg);
    const url = `${cfg.apiUrl!.replace(/\/$/, '')}/api/external/${cfg.policyId}/${cfg.blockTag}`;
    await fetchJson(url, { method: 'POST', headers: buildHeaders(cfg, accessToken), body: JSON.stringify(payload) });
  } catch (e: any) {
    errors.push(`external submit failed: ${e.message || e}`);
  }
}

function candidateMatch(vc: any, metadataHash: string, metadata: any): boolean {
  if (!vc) return false;
  const subj = vc.credentialSubject || vc.subject || vc.data?.credentialSubject || vc.data?.subject || vc;
  if (!subj) return false;
  if (subj.metadataHash && subj.metadataHash === metadataHash) return true;
  if (subj.sha256 && subj.sha256 === metadataHash) return true;
  if (subj.batchNumber && subj.batchNumber === metadata.batchNumber) return true;
  return false;
}

async function pollForVc(cfg: GuardianEnvConfig, metadataHash: string, metadata: any, errors: string[]): Promise<any | undefined> {
  const accessToken = await loginToGuardian(cfg);
  const bases = [
    `${cfg.apiUrl!.replace(/\/$/, '')}/api/credentials`,
    `${cfg.apiUrl!.replace(/\/$/, '')}/api/vc`,
    `${cfg.apiUrl!.replace(/\/$/, '')}/api/documents`
  ];
  for (let attempt = 1; attempt <= cfg.pollMaxAttempts; attempt++) {
    for (const base of bases) {
      try {
        const data = await fetchJson(base, { headers: buildHeaders(cfg, accessToken) });
        const list = Array.isArray(data) ? data : (data?.items || data?.result || []);
        for (const item of list) {
          if (candidateMatch(item, metadataHash, metadata)) return item;
        }
      } catch (e: any) {
        errors.push(`poll attempt ${attempt} ${base.split('/').pop()} error: ${e.message || e}`);
      }
    }
    await sleep(cfg.pollIntervalMs);
  }
  return undefined;
}

export async function issueGuardianCredential(metadata: any, metadataSha256: string): Promise<GuardianIssuanceResult> {
  const cfg = loadEnv();
  if (!cfg.enabled) return { status: 'disabled', mode: cfg.mode };
  const errors: string[] = [];

  if (cfg.mode === 'real') {
    if (!cfg.apiUrl || !cfg.policyId || !cfg.blockTag) {
      return { status: 'failed', errors: ['Missing apiUrl, policyId or blockTag for real Guardian mode'], mode: cfg.mode };
    }
  }

  // External payload structure matching our expanded schema
  const payload = {
    batchNumber: metadata.batchNumber,
    tokenId: metadata.tokenId,
    metadataHash: metadataSha256,
    fileRef: metadata?.storage?.ref || metadata?.fileRef || '',
    manufacturerDid: import.meta.env.VITE_MANUFACTURER_DID || metadata.manufacturer || 'unknown',
    drugName: metadata.medicine || metadata.drugName || 'Unknown Drug',
    activeIngredient: metadata.activeIngredient || 'Unknown',
    strength: metadata.strength || 'Unknown',
    manufacturingDate: metadata.manufacturingDate || new Date().toISOString().split('T')[0],
    expiryDate: metadata.expiryDate || '2025-12-31',
    quantity: metadata.quantity || 0
  };

  try {
    if (cfg.mode === 'real') {
      await submitExternal(cfg, payload, errors);
      const vcDoc = await pollForVc(cfg, metadataSha256, metadata, errors);
      if (vcDoc) {
        const vcId = vcDoc.id || vcDoc.vcId || vcDoc.documentId || vcDoc._id || `vc-${metadataSha256.substring(0,12)}`;
        let vcHash: string | undefined;
        try {
          vcHash = await hashCanonicalJson(vcDoc);
        } catch (e: any) {
          errors.push(`vc canonical hash error: ${e.message || e}`);
          vcHash = await computeSha256Hex(vcId + ':' + metadataSha256);
        }
        return { status: 'issued', vcId, vcHash, policyId: cfg.policyId, mode: 'real', errors: errors.length ? errors : undefined };
      }
      return { status: 'failed', errors: errors.concat('VC not found after polling'), policyId: cfg.policyId, mode: 'real' };
    }

    // Simulated path
    const vcId = `sim-vc-${metadataSha256.substring(0,16)}`;
    const vcHash = await computeSha256Hex(vcId + ':' + metadataSha256);
    return { status: 'issued', vcId, vcHash, policyId: cfg.policyId, mode: 'simulate', errors: errors.length ? errors : undefined };
  } catch (err: any) {
    errors.push(`Unhandled Guardian issuance error: ${err?.message || err}`);
    return { status: 'failed', errors, policyId: cfg.policyId, mode: cfg.mode };
  }
}
