import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Wallet, Shield, ExternalLink, Zap } from 'lucide-react';

const WalletTransactionNotice: React.FC = () => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-green-900">Real Blockchain Transactions</h4>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <Zap className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            </div>

            <p className="text-green-800 text-sm mb-3">
              🔐 Your wallet will sign each transaction on <strong>Hedera Testnet</strong>.
              All medicine batches, temperature logs, and certificates are stored on the real blockchain.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-green-700">
                <Wallet className="h-4 w-4" />
                <span><strong>HTS NFTs:</strong> Real tokens created</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="h-4 w-4" />
                <span><strong>HCS Topics:</strong> Real data logging</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <ExternalLink className="h-4 w-4" />
                <span><strong>Pinata IPFS:</strong> Real file storage</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs text-green-700">
                💡 <strong>Verify on HashScan:</strong> All transactions are publicly viewable at{' '}
                <a
                  href="https://hashscan.io/testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-900"
                >
                  hashscan.io/testnet
                </a>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletTransactionNotice;