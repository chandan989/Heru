import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Monitor,
  QrCode
} from 'lucide-react';
import { modernWalletService } from '../services/modernWalletService';

interface HederaWallet {
  accountId: string | null;
  isConnected: boolean;
  provider: any;
  walletType: 'hashpack' | 'blade' | 'kabila' | 'walletconnect' | null;
}

const ModernWalletConnect: React.FC = () => {
  const [wallet, setWallet] = useState<HederaWallet>({
    accountId: null,
    isConnected: false,
    provider: null,
    walletType: null
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Subscribe to wallet changes
    const unsubscribe = modernWalletService.onWalletChange((newWallet) => {
      setWallet(newWallet);
      setIsConnecting(false);
      if (newWallet.isConnected) {
        setError(null);
      }
    });

    // Get initial wallet state
    setWallet(modernWalletService.getWallet());

    return unsubscribe;
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await modernWalletService.connectWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await modernWalletService.disconnect();
  };

  const copyAccountId = async () => {
    if (wallet.accountId) {
      await navigator.clipboard.writeText(wallet.accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWalletIcon = (walletType: string | null) => {
    switch (walletType) {
      case 'hashpack':
        return '🏛️';
      case 'blade':
        return '⚔️';
      case 'walletconnect':
        return '📱';
      default:
        return '💳';
    }
  };

  const getWalletName = (walletType: string | null) => {
    switch (walletType) {
      case 'hashpack':
        return 'HashPack';
      case 'blade':
        return 'Blade Wallet';
      case 'walletconnect':
        return 'WalletConnect';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Heru Network Wallet
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!wallet.isConnected ? (
          <>
            {/* Connection Interface */}
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                Connect your Hedera wallet to interact with the Sacred Vault
              </div>
              
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
            
            {/* Supported Wallets */}
            <div className="border-t pt-4">
              <div className="text-xs text-gray-500 text-center mb-3">Supported Wallets</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <Monitor className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-xs text-gray-600">HashPack</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <Monitor className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-xs text-gray-600">Blade</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <QrCode className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-xs text-gray-600">Mobile</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Connected State */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getWalletIcon(wallet.walletType)} {getWalletName(wallet.walletType)}
                </Badge>
              </div>
              
              {/* Account Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Account ID</div>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono flex-1 truncate">
                    {wallet.accountId}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyAccountId}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://hashscan.io/testnet/account/${wallet.accountId}`, '_blank')}
                    className="h-6 w-6 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleDisconnect}
                  className="flex-1"
                >
                  Disconnect
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                  className="px-3"
                >
                  Debug
                </Button>
              </div>
            </div>
          </>
        )}
        
        {/* Debug Info */}
        {showDebug && (
          <div className="border-t pt-4">
            <div className="text-xs text-gray-500 mb-2">Debug Information</div>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(modernWalletService.getDebugInfo(), null, 2)}
            </pre>
          </div>
        )}
        
        {/* Real Blockchain Notice */}
        <div className="border-t pt-4">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-700">Real Blockchain Transactions</div>
              <div>All operations are performed on Hedera Testnet with actual HBAR fees and consensus.</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernWalletConnect;