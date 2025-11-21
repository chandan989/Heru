import { HashConnect } from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';

interface DappMeta {
    name: string; description: string; icons: string[]; url: string;
}
type PairingListener = (accounts: string[]) => void;

class HashConnectService {
    private instance: HashConnect | null = null;
    private meta: DappMeta;
    private debug: boolean;
    private initialized = false;
    private pairingString: string | undefined;
    private accounts: string[] = [];
    private pairingListeners: PairingListener[] = [];
    private logLines: string[] = [];
    private projectId: string;
    private readonly ACCOUNTS_KEY = 'heru_hashconnect_accounts_v1';
    private readonly PAIRING_KEY = 'heru_hashconnect_pairing_v1';

    constructor() {
        this.meta = {
            name: 'Heru DApp',
            description: 'Heru Hedera Application',
            icons: [typeof window !== 'undefined' ? window.location.origin + '/logo.svg' : ''],
            url: typeof window !== 'undefined' ? window.location.origin : ''
        };
        // WalletConnect / project id: attempt from env else placeholder (will still allow local modal, but pairing might fail)
        this.projectId = (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || 'demo';
        this.debug = true;
    }

    private log(msg: string, ...rest: any[]) {
        const line = `[HC ${new Date().toISOString()}] ${msg}`;
        this.logLines.push(line);
        if (this.logLines.length > 300) this.logLines.splice(0, 150);
        // eslint-disable-next-line no-console
        console.log(line, ...rest);
    }

    async init(): Promise<void> {
        if (this.initialized) return;
        try {
            this.instance = new HashConnect(LedgerId.TESTNET, this.projectId, this.meta, this.debug);
            this.instance.pairingEvent.on(session => {
                this.accounts = session.accountIds;
                this.log('Pairing event accounts', this.accounts);
                try {
                    localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(this.accounts));
                    if (this.pairingString) localStorage.setItem(this.PAIRING_KEY, this.pairingString);
                } catch {}
                this.pairingListeners.forEach(l => l(this.accounts));
            });
            await this.instance.init();
            this.pairingString = this.instance.pairingString;
            this.initialized = true;
            this.log('Initialized. Pairing string?', !!this.pairingString);
            // If a previous session restored (accounts already present)
            if (this.accounts.length) {
                this.pairingListeners.forEach(l => l(this.accounts));
            }
        } catch (e) {
            this.log('Init error', e);
            throw e;
        }
    }

    openModal() {
        if (!this.instance) throw new Error('HashConnect not initialized');
        this.instance.openPairingModal('dark');
    }

    getPairingString() { return this.pairingString; }
    getAccounts() { return this.accounts; }
    isReady() { return this.initialized; }
    isPaired() { return this.accounts.length > 0; }
    onPairing(cb: PairingListener) { this.pairingListeners.push(cb); return () => { this.pairingListeners = this.pairingListeners.filter(x => x!==cb); }; }
    getDebug() { return { accounts: this.accounts, pairingString: this.pairingString, initialized: this.initialized, log: [...this.logLines] }; }

    disconnect() {
        this.accounts = [];
        try {
            localStorage.removeItem(this.ACCOUNTS_KEY);
            localStorage.removeItem(this.PAIRING_KEY);
        } catch {}
        this.log('Disconnected & cleared persisted pairing');
    }

    /** Force re-initialize HashConnect from scratch (troubleshooting) */
    async forceReset() {
        this.disconnect();
        this.initialized = false;
        this.instance = null;
        this.pairingString = undefined;
        await this.init();
        this.log('Force reset complete');
    }
}

export const hashConnectService = new HashConnectService();
