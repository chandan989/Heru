/**
 * Hedera Wallet Integration Service
 * Updated to use Modern WalletConnect v2 with proper Modal UI
 */
import { SignClient } from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';
import { modernWalletService } from './modernWalletService';

// Re-export the modern service as the main wallet service for new code
export const modernWallet = modernWalletService;

// Export types for compatibility
export type { } from './modernWalletService';

interface HederaWallet {
  accountId: string | null;
  isConnected: boolean;
  provider: any;
  walletType: 'hashpack' | 'blade' | 'kabila' | null;
}

export class WalletService {
  private wallet: HederaWallet = {
    accountId: null,
    isConnected: false,
    provider: null,
    walletType: null
  };

  private listeners: Array<(wallet: HederaWallet) => void> = [];
  private signClient: InstanceType<typeof SignClient> | null = null;
  private session: SessionTypes.Struct | null = null;
  private readonly SESSION_STORAGE_KEY = 'heru_wc_session_topic_v1';
  public debugLog: string[] = [];
  private connectionMode: 'Extension' | 'WalletConnect' | 'None' = 'None';
  private projectId: string | null = null;

  constructor() {
    this.projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || null;
    this.debugLog.push(`[${new Date().toISOString()}] WalletService constructed.`);
    console.log('🏺 WalletService initialized');
    console.log('🔍 Project ID:', this.projectId ? `${this.projectId.slice(0, 8)}...` : 'NOT SET - WalletConnect disabled');
    
    // Debug HashPack extension detection after DOM loads
    this.detectWallets();
    
    // Only initialize WalletConnect if we have a project ID
    if (this.projectId) {
      this.initWalletConnect();
    } else {
      console.log('⚠️ WalletConnect disabled - no project ID provided. Using extension-only mode.');
    }
  }

  /**
   * Detect available wallets
   */
  private detectWallets() {
    this.debugLog.push(`[${new Date().toISOString()}] Starting wallet detection.`);
    // Check immediately
    this.checkForWallets();
    
    // Check periodically for late-loading extensions
    const checkInterval = setInterval(() => {
      this.checkForWallets();
    }, 1000);

    // Stop checking after 10 seconds
    setTimeout(() => {
      this.debugLog.push(`[${new Date().toISOString()}] Stopping periodic wallet checks.`);
      clearInterval(checkInterval);
    }, 10000);
  }

  private checkForWallets() {
    if (typeof window !== 'undefined') {
      const win = window as any;
      this.debugLog.push(`[${new Date().toISOString()}] Running check for wallets...`);
      
      const keys = Object.keys(win).filter(key => 
        key.toLowerCase().includes('hash') || 
        key.toLowerCase().includes('pack') || 
        key.toLowerCase().includes('hedera') ||
        key.toLowerCase().includes('blade')
      );
      this.debugLog.push(`- Found potential keys: ${keys.join(', ') || 'None'}`);
      this.debugLog.push(`- window.hashpack: ${!!win.hashpack}`);
      this.debugLog.push(`- window.bladeWallet: ${!!win.bladeWallet}`);
      this.debugLog.push(`- window.ethereum.isHashPack: ${!!win.ethereum?.isHashPack}`);
      
      const hashPackExists = this.isHashPackAvailable();
      
      if (hashPackExists) {
        this.debugLog.push('-> HashPack detected as available.');
      } else {
        this.debugLog.push('-> HashPack NOT detected as available.');
      }
    } else {
      this.debugLog.push(`[${new Date().toISOString()}] Window is undefined, skipping check.`);
    }
  }

  /**
   * Poll for HashPack injection (extension can be late). Resolves early if found.
   */
  private async waitForHashPack(maxMs = 4000, interval = 200): Promise<any | null> {
    if (typeof window === 'undefined') return null;
    const win = window as any;
    const start = Date.now();
    return new Promise(resolve => {
      const tick = () => {
        const provider = this.locateHashPackProvider();
        if (provider) return resolve(provider);
        if (Date.now() - start > maxMs) return resolve(null);
        setTimeout(tick, interval);
      };
      tick();
    });
  }

  /**
   * Try to locate a HashPack provider in known window locations.
   */
  private locateHashPackProvider(): any | null {
    if (typeof window === 'undefined') return null;
    const win = window as any;
    if (win.hashpack) return win.hashpack;
    if (win.ethereum?.isHashPack) return win.ethereum;
    if (win.ethereum?.connectToLocalWallet) return win.ethereum;
    if (win.ethereum?.providers) {
      const p = win.ethereum.providers.find((p: any) => p?.isHashPack || p?.name?.toLowerCase().includes('hashpack'));
      if (p) return p;
    }
    return null;
  }

  /**
   * Initialize WalletConnect SignClient
   */
  private async initWalletConnect() {
    try {
      if (!this.projectId) {
        console.warn('⚠️ No WalletConnect Project ID provided');
        return;
      }

      this.signClient = await SignClient.init({
        projectId: this.projectId,
        metadata: {
          name: "Heru Medical Supply Chain",
          description: "Secure medicine tracking on Hedera blockchain",
          url: typeof window !== 'undefined' ? window.location.origin : "http://localhost:5173",
          icons: [`${typeof window !== 'undefined' ? window.location.origin : "http://localhost:5173"}/logo.svg`]
        },
      });

      this.debugLog.push(`[${new Date().toISOString()}] WalletConnect initialized.`);
      console.log('✅ WalletConnect initialized successfully');
      this.setupWalletConnectEvents();

      // Attempt to restore previous session
      this.tryRestoreSession();
    } catch (error) {
      this.debugLog.push(`[${new Date().toISOString()}] WalletConnect init failed: ${error}`);
      console.error('❌ WalletConnect initialization failed:', error);
    }
  }

  /**
   * Attempt to restore an existing WalletConnect session from storage.
   */
  private async tryRestoreSession() {
    if (!this.signClient) return;
    try {
      const topic = localStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!topic) {
        this.debugLog.push('No session topic found in storage.');
        return;
      }
      this.debugLog.push(`Found session topic in storage: ${topic}`);
      // WalletConnect SignClient v2 stores sessions internally; use session.get or list
      let restored: SessionTypes.Struct | null = null;
      try {
        // @ts-ignore attempt direct get if available
        if (this.signClient.session && typeof (this.signClient as any).session.get === 'function') {
          restored = (this.signClient as any).session.get(topic) as SessionTypes.Struct;
        }
      } catch {}
      if (!restored) {
        try {
          // Fallback: enumerate sessions
          const all = (this.signClient as any).session.getAll?.() as SessionTypes.Struct[] | undefined;
          if (all && Array.isArray(all)) {
            restored = all.find(s => s.topic === topic) || null;
          }
        } catch {}
      }
      if (!restored) {
        localStorage.removeItem(this.SESSION_STORAGE_KEY);
        this.debugLog.push('Session topic was invalid, removed from storage.');
        return;
      }
      this.debugLog.push('♻️ Restoring previous WalletConnect session.');
      console.log('♻️ Restoring previous WalletConnect session');
      this.handleSessionConnect(restored);
    } catch (e) {
      this.debugLog.push(`⚠️ Failed to restore session: ${e}`);
      console.warn('⚠️ Failed to restore session:', e);
    }
  }

  /**
   * Set up WalletConnect event listeners
   */
  private setupWalletConnectEvents() {
    if (!this.signClient) return;

    // Session proposal (when connecting)
    this.signClient.on('session_proposal', (args: any) => {
      console.log('📋 WalletConnect session proposal:', args);
    });

    // Session connect (successful connection)
    this.signClient.on('session_connect', (args: any) => {
      console.log('🔗 WalletConnect session connected:', args);
      const session = args.session || args;
      this.handleSessionConnect(session);
    });

    // Session delete (disconnection)
    this.signClient.on('session_delete', (args: any) => {
      console.log('🔌 WalletConnect session disconnected:', args);
      this.handleSessionDisconnect();
    });

    // Session update
    this.signClient.on('session_update', (args: { topic: string; params: any }) => {
      console.log('🔄 WalletConnect session updated:', args);
    });

    // Session ping
    this.signClient.on('session_ping', (args: { topic: string; id: number }) => {
      console.log('🏓 WalletConnect session ping:', args);
    });

    // Session event
    this.signClient.on('session_event', (args: { topic: string; params: any }) => {
      console.log('📡 WalletConnect session event:', args);
    });
  }

  /**
   * Handle successful WalletConnect session
   */
  private handleSessionConnect(session: SessionTypes.Struct) {
    this.session = session;
    this.connectionMode = 'WalletConnect';
    try {
      localStorage.setItem(this.SESSION_STORAGE_KEY, session.topic);
    } catch {}
    
    // Extract Hedera account from session
    const hederaNamespace = session.namespaces?.['hedera'];
    if (hederaNamespace?.accounts?.[0]) {
      // Account format: "hedera:testnet:0.0.123456"
      const accountId = hederaNamespace.accounts[0].split(':')[2];
      this.wallet = {
        accountId,
        isConnected: true,
        provider: this.signClient,
        walletType: 'hashpack'
      };
      this.notifyListeners();
      console.log('✅ HashPack connected via WalletConnect:', this.wallet.accountId);
    }
  }

  /**
   * Connect with pairing string display (QR code alternative)
   */
  async connectWithPairingString(): Promise<{ success: boolean; uri?: string; error?: string }> {
    try {
      if (!this.signClient || !this.projectId) {
        return { success: false, error: 'WalletConnect not initialized' };
      }

      console.log('🔗 Generating WalletConnect pairing string...');

      const { uri, approval } = await this.signClient.connect({
        requiredNamespaces: {
          hedera: {
            methods: ['hedera_getNodeAddresses', 'hedera_executeTransaction', 'hedera_signMessage'],
            chains: ['hedera:testnet'],
            events: []
          }
        },
      });

      if (uri) {
        console.log('📋 Pairing URI generated:', uri);
        
        // Return the URI so UI can display it or show as QR code
        return { success: true, uri };
      }

      return { success: false, error: 'Failed to generate pairing URI' };
    } catch (error) {
      console.error('❌ Pairing string generation failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Handle WalletConnect session disconnect
   */
  private handleSessionDisconnect() {
    this.wallet = {
      accountId: null,
      isConnected: false,
      provider: null,
      walletType: null
    };
    this.session = null;
    this.connectionMode = 'None';
    try { localStorage.removeItem(this.SESSION_STORAGE_KEY); } catch {}
    this.notifyListeners();
  }

  /**
   * Check if HashPack is available
   */
  private isHashPackAvailable(): boolean {
    if (typeof window !== 'undefined') {
      const win = window as any;
      
      // Check for browser extension in multiple locations
      const hasExtension = !!(
        win.hashpack || 
        win.HashConnect || 
        win.ethereum?.isHashPack ||
        (win.ethereum && win.ethereum.providers?.find((p: any) => p.isHashPack)) ||
        (win.ethereum && win.ethereum.connectToLocalWallet) // HashPack methods in ethereum object
      );
      
      if (hasExtension) {
        this.debugLog.push('isHashPackAvailable: Extension found -> true');
        return true;
      }
    }
    
    // WalletConnect is a fallback, not an "installation" status for the main button.
    // The UI should decide what to do if no direct extension is found.
    this.debugLog.push('isHashPackAvailable: No extension found -> false');
    return false;
  }

  /**
   * Check if Blade is available
   */
  private isBladeAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).bladeWallet;
  }

  /**
   * Connect to HashPack wallet
   */
  async connectHashPack(): Promise<{ success: boolean; uri?: string; error?: string }> {
    try {
      this.debugLog.push(`[${new Date().toISOString()}] connectHashPack called.`);
      console.log('🔗 Attempting HashPack connection...');
      // Method 1: Try direct browser extension first (with short polling window for late injection)
      let hashpackProvider = this.locateHashPackProvider();
      if (!hashpackProvider) {
        this.debugLog.push('No provider found immediately. Waiting...');
        console.log('🕒 Waiting briefly for potential late HashPack injection...');
        hashpackProvider = await this.waitForHashPack();
      }

      if (hashpackProvider) {
        this.debugLog.push('Found a provider. Attempting to connect via extension.');
        console.log('📱 Trying HashPack browser extension...');
        try {
          let data: any = null;
          if (typeof hashpackProvider.connectToLocalWallet === 'function') {
            data = await hashpackProvider.connectToLocalWallet();
          } else if (typeof hashpackProvider.connect === 'function') {
            // Some versions expose a simple connect() method
            data = await hashpackProvider.connect();
          }

          if (data?.accountIds?.length > 0) {
            this.connectionMode = 'Extension';
            this.wallet = {
              accountId: data.accountIds[0],
              isConnected: true,
              provider: hashpackProvider,
              walletType: 'hashpack'
            };
            this.notifyListeners();
            this.debugLog.push(`✅ Extension connected successfully. Account: ${data.accountIds[0]}`);
            console.log('✅ HashPack connected via extension:', this.wallet.accountId);
            return { success: true };
          } else {
            this.debugLog.push('⚠️ Extension connect returned no accounts.');
            console.warn('⚠️ HashPack direct extension connect returned no accounts');
          }
        } catch (extensionError) {
          this.debugLog.push(`⚠️ Extension connect failed: ${extensionError}`);
          console.warn('⚠️ HashPack extension connect failed, falling back to WalletConnect...', extensionError);
        }
      } else {
        this.debugLog.push('No extension provider found after wait. Using WalletConnect fallback.');
        console.log('📱 HashPack extension not detected after wait, using WalletConnect fallback');
      }

      // Method 2: WalletConnect fallback (only if configured)
      if (!this.projectId) {
        this.debugLog.push('WalletConnect not configured, no fallback available.');
        return { 
          success: false, 
          error: 'HashPack extension not found and WalletConnect not configured. Please install HashPack browser extension.' 
        };
      }

      if (!this.signClient) {
        this.debugLog.push('WalletConnect not initialized, cannot fallback.');
        return { success: false, error: 'WalletConnect not initialized' };
      }

      this.debugLog.push('Attempting WalletConnect connection.');
      console.log('📱 Connecting HashPack via WalletConnect...');

      const { uri, approval } = await this.signClient.connect({
        requiredNamespaces: {
          hedera: {
            methods: [
              'hedera_getNodeAddresses', 
              'hedera_executeTransaction', 
              'hedera_signMessage',
              'hedera_getAccountInfo'
            ],
            chains: ['hedera:testnet'], // or 'hedera:mainnet' for production
            events: ['accountsChanged', 'chainChanged']
          }
        },
      });

      if (uri) {
        this.debugLog.push('WalletConnect URI generated.');
        console.log('📱 WalletConnect URI generated:', uri);
        
        // For mobile: return URI for QR code display
        // For desktop: try to open HashPack directly
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) {
          // Try to open HashPack desktop app or website
          const hashpackUrl = `https://wallet.hashpack.app/wc?uri=${encodeURIComponent(uri)}`;
          window.open(hashpackUrl, '_blank', 'noopener,noreferrer');
        }
        
        this.debugLog.push('Waiting for WalletConnect session approval...');
        console.log('⏳ Waiting for HashPack approval...');
        
        // Wait for approval with timeout
        const session = await Promise.race([
          approval(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 30000)
          )
        ]) as SessionTypes.Struct;
        
        this.debugLog.push('✅ WalletConnect session approved.');
        console.log('✅ HashPack session approved!', session);
        return { success: true };
      }

      this.debugLog.push('Failed to generate WalletConnect URI.');
      return { success: false, error: 'Failed to generate WalletConnect URI' };
    } catch (error) {
      this.debugLog.push(`❌ connectHashPack failed: ${error}`);
      console.error('❌ HashPack connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Connect to Blade wallet
   */
  async connectBlade(): Promise<boolean> {
    try {
      if (!this.isBladeAvailable()) {
        throw new Error('Blade wallet not installed');
      }

      const blade = (window as any).bladeWallet;
      
      // Get account info from Blade
      const result = await blade.createAccount();
      
      if (result?.accountId) {
        this.wallet = {
          accountId: result.accountId,
          isConnected: true,
          provider: blade,
          walletType: 'blade'
        };
        
        this.notifyListeners();
        console.log('✅ Blade connected:', this.wallet.accountId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Blade connection failed:', error);
      return false;
    }
  }

  /**
   * Auto-connect to available wallet
   */
  async connectWallet(): Promise<{ 
    success: boolean; 
    wallet?: string; 
    error?: string; 
    uri?: string;
    requiresMobile?: boolean;
  }> {
    try {
      console.log('🎯 Starting wallet connection...');
      
      // Try HashPack first
      if (this.isHashPackAvailable()) {
        console.log('📱 Attempting HashPack connection...');
        const result = await this.connectHashPack();
        
        if (result.success) {
          return { success: true, wallet: 'HashPack' };
        } else if (result.uri) {
          return { 
            success: false, 
            wallet: 'HashPack', 
            uri: result.uri,
            requiresMobile: true,
            error: 'Please scan QR code with HashPack mobile app'
          };
        } else if (result.error) {
          console.warn('HashPack connection failed:', result.error);
        }
      }

      // Try Blade next
      if (this.isBladeAvailable()) {
        console.log('⚔️ Attempting Blade connection...');
        const connected = await this.connectBlade();
        if (connected) {
          return { success: true, wallet: 'Blade' };
        }
      }

      return { 
        success: false, 
        error: 'No Hedera wallet found. Please install HashPack or Blade wallet extension.' 
      };
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown wallet error' 
      };
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    try {
      if (this.session && this.signClient) {
        await this.signClient.disconnect({
          topic: this.session.topic,
          reason: {
            code: 6000,
            message: 'User disconnected'
          }
        });
      }
    } catch (error) {
      console.error('Error disconnecting WalletConnect:', error);
    }

    this.wallet = {
      accountId: null,
      isConnected: false,
      provider: null,
      walletType: null
    };
    
    this.session = null;
    this.notifyListeners();
    console.log('🔌 Wallet disconnected');
  }

  /**
   * Send transaction via connected wallet
   */
  async sendTransaction(transactionBytes: Uint8Array | string): Promise<any> {
    if (!this.wallet.isConnected || !this.wallet.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      if (this.wallet.walletType === 'hashpack') {
        if (this.session && this.signClient) {
          // WalletConnect method
          const result = await this.signClient.request({
            topic: this.session.topic,
            chainId: 'hedera:testnet',
            request: {
              method: 'hedera_executeTransaction',
              params: {
                transactionBytes: transactionBytes instanceof Uint8Array 
                  ? Array.from(transactionBytes) 
                  : transactionBytes
              }
            }
          });
          return result;
        } else {
          // Direct extension method
          return await this.wallet.provider.sendTransaction({
            transactionBytes: transactionBytes
          });
        }
      } else if (this.wallet.walletType === 'blade') {
        return await this.wallet.provider.signTransaction(transactionBytes);
      }
      
      throw new Error('Unsupported wallet type');
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Get current wallet state
   */
  getWallet(): HederaWallet {
    return { ...this.wallet };
  }

  public getConnectionMode(): 'Extension' | 'WalletConnect' | 'None' {
    return this.connectionMode;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.wallet.isConnected && !!this.wallet.accountId;
  }

  /**
   * Get available wallets
   */
  getAvailableWallets(): Array<{ name: string; installed: boolean; icon: string }> {
    return [
      {
        name: 'HashPack',
        installed: this.isHashPackAvailable(),
        icon: '🔗'
      },
      {
        name: 'Blade',
        installed: this.isBladeAvailable(),
        icon: '⚔️'
      }
    ];
  }

  /**
   * Subscribe to wallet changes
   */
  onWalletChange(callback: (wallet: HederaWallet) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of wallet changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.wallet);
      } catch (error) {
        console.error('Error in wallet change listener:', error);
      }
    });
  }
}

// Export singleton instance
// Keep original WalletService for backward compatibility
export const walletService = new WalletService();
export default walletService;