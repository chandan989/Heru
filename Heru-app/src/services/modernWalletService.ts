/**
 * Modern Hedera Wallet Integration Service
 * Updated WalletConnect v2 with new Modal UI
 */
// Note: Using custom modal implementation since @web3modal doesn't support Hedera natively

interface HederaWallet {
  accountId: string | null;
  isConnected: boolean;
  provider: any;
  walletType: 'hashpack' | 'blade' | 'kabila' | 'walletconnect' | null;
}

// WalletConnect v2 Configuration
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '6eff872f38dd99c653bcf7438af292b5';

// 2. Set chains - Hedera is not directly supported by Web3Modal, so we'll use a custom approach
const chains = [
  {
    chainId: 296,
    name: 'Hedera Testnet',
    currency: 'HBAR',
    explorerUrl: 'https://hashscan.io/testnet',
    rpcUrl: 'https://testnet.mirrornode.hedera.com'
  }
];

// 3. Create a metadata object
const metadata = {
  name: 'Heru - Sacred Vault',
  description: 'Pharmaceutical Supply Chain Verification on Hedera',
  url: 'https://heru.pharma',
  icons: ['https://heru.pharma/icon.png']
};

export class ModernWalletService {
  private wallet: HederaWallet = {
    accountId: null,
    isConnected: false,
    provider: null,
    walletType: null
  };

  private listeners: Array<(wallet: HederaWallet) => void> = [];
  public debugLog: string[] = [];
  private connectionMode: 'Extension' | 'WalletConnect' | 'None' = 'None';
  private safeMode = true; // Enable safe mode to prevent errors

  constructor() {
    this.debugLog.push(`[${new Date().toISOString()}] Modern WalletService initialized in safe mode.`);
    console.log('🔮 Modern WalletService with WalletConnect v2 Modal (Safe Mode)');
    console.log('🆔 Project ID:', projectId ? `${projectId.slice(0, 8)}...` : 'NOT SET');
    
    // Initialize safe mode first
    this.initializeSafeMode();
    
    // Initialize modern wallet detection
    this.initializeWallets();
  }

  private initializeSafeMode() {
    try {
      // Prevent contract-related errors by wrapping operations
      if (typeof window !== 'undefined') {
        this.checkWalletProviders();
      }
    } catch (error) {
      console.warn('Safe mode initialization warning:', error);
      this.safeMode = true;
    }
  }

  private checkWalletProviders() {
    try {
      // Safely check for wallet providers without causing 'in' operator errors
      const hasHashPack = typeof (window as any).hashpack !== 'undefined';
      const hasEthereum = typeof (window as any).ethereum !== 'undefined';
      
      if (hasHashPack) {
        this.debugLog.push('HashPack detected');
      }
      if (hasEthereum) {
        this.debugLog.push('Ethereum provider detected');
      }
    } catch (error) {
      console.warn('Wallet provider check failed:', error);
    }
  }

  /**
   * Initialize modern wallet connections
   */
  private async initializeWallets() {
    try {
      // Check for HashPack extension first
      if (typeof window !== 'undefined') {
        // HashPack detection
        if ((window as any).hashpack) {
          console.log('✅ HashPack extension detected');
          this.debugLog.push('HashPack extension found');
        }

        // Blade extension detection  
        if ((window as any).blade) {
          console.log('✅ Blade extension detected');
          this.debugLog.push('Blade extension found');
        }
      }
    } catch (error) {
      console.error('❌ Wallet initialization error:', error);
    }
  }

  /**
   * Connect wallet with modern UI
   */
  async connectWallet(): Promise<HederaWallet> {
    console.log('🔗 Starting modern wallet connection...');
    this.debugLog.push(`[${new Date().toISOString()}] Connection attempt started`);

    try {
      // Try HashPack first
      const hashpackResult = await this.tryHashPack();
      if (hashpackResult) {
        console.log('✅ HashPack connection successful');
        return hashpackResult;
      }

      // Try Blade
      const bladeResult = await this.tryBlade();
      if (bladeResult) {
        console.log('✅ Blade connection successful');
        return bladeResult;
      }

      // Fallback to WalletConnect with new modal
      return await this.connectWithModernWalletConnect();

    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      this.debugLog.push(`Connection failed: ${error}`);
      throw error;
    }
  }

  /**
   * Try HashPack connection
   */
  private async tryHashPack(): Promise<HederaWallet | null> {
    if (typeof window === 'undefined' || !(window as any).hashpack) {
      return null;
    }

    try {
      const hashpack = (window as any).hashpack;
      const appMetadata = {
        name: "Heru - Sacred Vault",
        description: "Pharmaceutical Supply Chain Verification",
        icons: ["https://heru.pharma/icon.png"],
        url: "https://heru.pharma"
      };

      const initData = await hashpack.init(appMetadata);
      console.log('HashPack init result:', initData);

      if (initData.success) {
        const accountIds = initData.savedPairings?.[0]?.accountIds || [];
        if (accountIds.length > 0) {
          this.wallet = {
            accountId: accountIds[0],
            isConnected: true,
            provider: hashpack,
            walletType: 'hashpack'
          };

          this.connectionMode = 'Extension';
          this.notifyListeners();
          return this.wallet;
        }
      }
    } catch (error) {
      console.warn('HashPack connection failed:', error);
    }

    return null;
  }

  /**
   * Try Blade connection
   */
  private async tryBlade(): Promise<HederaWallet | null> {
    if (typeof window === 'undefined' || !(window as any).blade) {
      return null;
    }

    try {
      const blade = (window as any).blade;
      const result = await blade.createHederaAccount("testnet", "Heru Sacred Vault");
      
      if (result.success && result.accountId) {
        this.wallet = {
          accountId: result.accountId,
          isConnected: true,
          provider: blade,
          walletType: 'blade'
        };

        this.connectionMode = 'Extension';
        this.notifyListeners();
        return this.wallet;
      }
    } catch (error) {
      console.warn('Blade connection failed:', error);
    }

    return null;
  }

  /**
   * Connect with modern WalletConnect Modal
   */
  private async connectWithModernWalletConnect(): Promise<HederaWallet> {
    console.log('🌐 Attempting WalletConnect v2 with Modal...');
    
    try {
      // Create modern Web3Modal for WalletConnect
      // Note: This is a placeholder for when WalletConnect properly supports Hedera
      // For now, we'll show a modern-looking connection interface
      
      const modal = this.createModernConnectionModal();
      const result = await modal.show();
      
      if (result && typeof result === 'object' && 'accountId' in result) {
        this.wallet = {
          accountId: (result as any).accountId,
          isConnected: true,
          provider: (result as any).provider,
          walletType: 'walletconnect'
        };

        this.connectionMode = 'WalletConnect';
        this.notifyListeners();
        return this.wallet;
      }
    } catch (error) {
      console.error('Modern WalletConnect failed:', error);
    }

    throw new Error('No wallet connection method available');
  }

  /**
   * Create modern connection modal
   */
  private createModernConnectionModal() {
    return {
      show: async () => {
        return new Promise((resolve, reject) => {
          // Create modern modal HTML
          const modalHTML = `
            <div id="modern-wallet-modal" style="
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              font-family: system-ui, -apple-system, sans-serif;
            ">
              <div style="
                background: white;
                border-radius: 16px;
                padding: 32px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                text-align: center;
              ">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
                  🔮 Connect Your Wallet
                </div>
                <div style="color: #666; margin-bottom: 24px;">
                  Choose your preferred Hedera wallet to continue
                </div>
                
                <div id="wallet-options" style="display: flex; flex-direction: column; gap: 12px;">
                  <button class="wallet-option" data-wallet="hashpack" style="
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    border: 2px solid #e5e5e5;
                    border-radius: 12px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                  ">
                    <div style="
                      width: 40px;
                      height: 40px;
                      background: linear-gradient(45deg, #6366f1, #8b5cf6);
                      border-radius: 8px;
                      margin-right: 16px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-weight: bold;
                    ">HP</div>
                    <div>
                      <div style="font-weight: 600; color: #111;">HashPack</div>
                      <div style="color: #666; font-size: 14px;">Browser Extension</div>
                    </div>
                  </button>
                  
                  <button class="wallet-option" data-wallet="blade" style="
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    border: 2px solid #e5e5e5;
                    border-radius: 12px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                  ">
                    <div style="
                      width: 40px;
                      height: 40px;
                      background: linear-gradient(45deg, #ef4444, #f97316);
                      border-radius: 8px;
                      margin-right: 16px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-weight: bold;
                    ">B</div>
                    <div>
                      <div style="font-weight: 600; color: #111;">Blade Wallet</div>
                      <div style="color: #666; font-size: 14px;">Browser Extension</div>
                    </div>
                  </button>
                  
                  <button class="wallet-option" data-wallet="walletconnect" style="
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    border: 2px solid #e5e5e5;
                    border-radius: 12px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                  ">
                    <div style="
                      width: 40px;
                      height: 40px;
                      background: linear-gradient(45deg, #3b82f6, #06b6d4);
                      border-radius: 8px;
                      margin-right: 16px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-weight: bold;
                    ">WC</div>
                    <div>
                      <div style="font-weight: 600; color: #111;">WalletConnect</div>
                      <div style="color: #666; font-size: 14px;">Scan with mobile wallet</div>
                    </div>
                  </button>
                </div>
                
                <button id="close-modal" style="
                  margin-top: 24px;
                  padding: 12px 24px;
                  background: #f3f4f6;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  color: #666;
                ">Cancel</button>
              </div>
            </div>
          `;

          // Insert modal into DOM
          document.body.insertAdjacentHTML('beforeend', modalHTML);
          
          const modal = document.getElementById('modern-wallet-modal')!;
          
          // Add hover effects
          const style = document.createElement('style');
          style.textContent = `
            .wallet-option:hover {
              border-color: #3b82f6 !important;
              background: #f8faff !important;
            }
          `;
          document.head.appendChild(style);
          
          // Handle wallet selection
          modal.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;
            const walletOption = target.closest('.wallet-option') as HTMLElement;
            
            if (walletOption) {
              const walletType = walletOption.getAttribute('data-wallet');
              
              try {
                let result = null;
                
                if (walletType === 'hashpack') {
                  result = await this.tryHashPack();
                } else if (walletType === 'blade') {
                  result = await this.tryBlade();
                } else if (walletType === 'walletconnect') {
                  // Show QR code or redirect to mobile
                  alert('WalletConnect QR Code would appear here in full implementation');
                }
                
                modal.remove();
                style.remove();
                resolve(result);
              } catch (error) {
                modal.remove();
                style.remove();
                reject(error);
              }
            }
            
            if (target.id === 'close-modal') {
              modal.remove();
              style.remove();
              reject(new Error('User cancelled'));
            }
          });
        });
      }
    };
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
  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.wallet);
      } catch (error) {
        console.error('Wallet change listener error:', error);
      }
    });
  }

  /**
   * Get current wallet state
   */
  getWallet(): HederaWallet {
    return { ...this.wallet };
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    this.wallet = {
      accountId: null,
      isConnected: false,
      provider: null,
      walletType: null
    };
    
    this.connectionMode = 'None';
    this.notifyListeners();
    console.log('🔌 Wallet disconnected');
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      wallet: this.wallet,
      connectionMode: this.connectionMode,
      logs: this.debugLog,
      projectId: projectId ? `${projectId.slice(0, 8)}...` : 'NOT SET'
    };
  }
}

// Export singleton instance
export const modernWalletService = new ModernWalletService();