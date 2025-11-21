/**
 * Legacy Wallet Connector - Replaced by SimpleWalletConnector
 * Keeping this file to prevent import errors
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export const WalletConnector: React.FC = () => {
  return (
    <Button variant="outline" size="sm" disabled>
      <Wallet className="h-4 w-4 mr-2" />
      Legacy Connector
    </Button>
  );
};

export default WalletConnector;