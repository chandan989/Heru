import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle } from 'lucide-react';
import { WalletConnectModal } from '@walletconnect/modal';
import { SignClient } from '@walletconnect/sign-client';
import { modernWalletService } from '@/services/modernWalletService';

interface WalletState {
  accountId: string | null;
  isConnected: boolean;
  network: string;
}

const SimpleWalletConnector: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>({
    accountId: null,
    isConnected: false,
    network: 'testnet'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [signClient, setSignClient] = useState<SignClient | null>(null);
  const [modal, setModal] = useState<WalletConnectModal | null>(null);

  useEffect(() => {
    initWalletConnect();
  }, []);

  const initWalletConnect = async () => {
    try {
      const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '6eff872f38dd99c653bcf7438af292b5';
      
      // Initialize SignClient
      const client = await SignClient.init({
        projectId,
        metadata: {
          name: "Heru - Sacred Vault",
          description: "Pharmaceutical Supply Chain Verification on Hedera",
          url: window.location.origin,
          icons: [`${window.location.origin}/logo.svg`]
        }
      });

      setSignClient(client);

      // Initialize Modal
      const walletConnectModal = new WalletConnectModal({
        projectId,
        chains: ['hedera:testnet']
      });

      setModal(walletConnectModal);

      // Check for existing sessions
      const sessions = client.session.getAll();
      if (sessions.length > 0) {
        const session = sessions[0];
        const hederaNamespace = session.namespaces?.['hedera'];
        if (hederaNamespace?.accounts?.[0]) {
          const accountId = hederaNamespace.accounts[0].split(':')[2];
          setWallet({
            accountId,
            isConnected: true,
            network: 'testnet'
          });
          
          // 🆕 Sync with modernWalletService
          modernWalletService['wallet'] = {
            accountId,
            isConnected: true,
            provider: client,
            walletType: 'walletconnect'
          };
          
          console.log('✅ Restored wallet session:', accountId);
          console.log('💎 Ready to sign transactions with connected wallet!');
        }
      }
    } catch (error) {
      console.error('WalletConnect init failed:', error);
    }
  };

  const connectWallet = async () => {
    if (!signClient || !modal) {
      console.log('WalletConnect not ready yet...');
      return;
    }

    setIsConnecting(true);
    
    try {
      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          hedera: {
            methods: ['hedera_getNodeAddresses', 'hedera_executeTransaction', 'hedera_signMessage'],
            chains: ['hedera:testnet'],
            events: []
          }
        }
      });

      if (uri) {
        // Open modal with URI
        modal.openModal({ uri });

        // Wait for approval
        const session = await approval();
        
        const hederaNamespace = session.namespaces?.['hedera'];
        if (hederaNamespace?.accounts?.[0]) {
          const accountId = hederaNamespace.accounts[0].split(':')[2];
          setWallet({
            accountId,
            isConnected: true,
            network: 'testnet'
          });
          
          // 🆕 Update modernWalletService so hederaNativeService can use it!
          modernWalletService['wallet'] = {
            accountId,
            isConnected: true,
            provider: signClient,
            walletType: 'walletconnect'
          };
          
          console.log('✅ Wallet connected and synced:', accountId);
          console.log('💎 This wallet will now be used for ALL blockchain transactions!');
        }

        modal.closeModal();
      }
    } catch (error) {
      console.error('WalletConnect connection failed:', error);
      modal?.closeModal();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (signClient) {
      const sessions = signClient.session.getAll();
      if (sessions.length > 0) {
        await signClient.disconnect({
          topic: sessions[0].topic,
          reason: {
            code: 6000,
            message: 'User disconnected'
          }
        });
      }
    }
    
    setWallet({
      accountId: null,
      isConnected: false,
      network: 'testnet'
    });
    
    // 🆕 Sync disconnect with modernWalletService
    modernWalletService['wallet'] = {
      accountId: null,
      isConnected: false,
      provider: null,
      walletType: null
    };
    
    console.log('🔌 Wallet disconnected');
  };

  // Connected state
  if (wallet.isConnected && wallet.accountId) {
    return (
      <Button 
        onClick={disconnectWallet}
        variant="default"
        size="sm"
        className="gap-2 bg-green-600 hover:bg-green-700"
        title={`Connected: ${wallet.accountId}`}
      >
        <CheckCircle className="h-4 w-4" />
        <span className="hidden md:inline">
          {wallet.accountId.slice(0, 8)}...
        </span>
        <span className="md:hidden">✓</span>
      </Button>
    );
  }

  // Connect button
  return (
    <Button 
      onClick={connectWallet}
      disabled={isConnecting}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden md:inline">
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </span>
    </Button>
  );
};

export default SimpleWalletConnector;