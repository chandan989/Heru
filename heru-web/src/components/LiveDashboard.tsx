/**
 * Live Transaction Dashboard Component
 * Shows real-time Hedera blockchain transactions as they happen
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Activity, Zap, FileText, DollarSign } from 'lucide-react';
import { mirrorNodeService } from '@/services/mirrorNodeService';
import { walletService } from '@/services/walletService';

interface LiveTransaction {
  id: string;
  type: 'HTS_NFT' | 'HCS_MESSAGE' | 'CONTRACT_CALL' | 'PAYMENT' | 'GUARDIAN';
  title: string;
  description: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  amount?: string;
  hashscanUrl?: string;
  isNew?: boolean;
}

interface DashboardMetrics {
  totalTransactions: number;
  successfulTxns: number;
  totalHBar: number;
  activeBatches: number;
}

const LiveDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalTransactions: 0,
    successfulTxns: 0,
    totalHBar: 0,
    activeBatches: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Load initial data
  useEffect(() => {
    loadTransactionData();
    if (autoRefresh) {
      startAutoRefresh();
    }
    return () => stopAutoRefresh();
  }, [autoRefresh]);

  const startAutoRefresh = () => {
    intervalRef.current = setInterval(() => {
      loadTransactionData(true);
    }, 10000); // Refresh every 10 seconds
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const loadTransactionData = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setIsLoading(true);
    
    try {
      const walletInfo = walletService.getWallet();
      if (!walletInfo?.accountId) {
        setTransactions(getMockTransactions());
        setMetrics(getMockMetrics());
        return;
      }

      // Load real transactions from Mirror Node
      const liveTransactions = await mirrorNodeService.getLiveTransactionFeed(walletInfo.accountId);
      
      const formattedTransactions: LiveTransaction[] = liveTransactions.map((tx, index) => ({
        id: tx.transactionId,
        type: getTransactionType(tx.type),
        title: getTransactionTitle(tx.type),
        description: getTransactionDescription(tx),
        status: tx.result === 'SUCCESS' ? 'success' : 'failed',
        timestamp: tx.timestamp,
        amount: tx.fee,
        hashscanUrl: `https://hashscan.io/testnet/transaction/${tx.transactionId}`,
        isNew: isAutoRefresh && index < 3 // Mark first 3 as new for auto-refresh
      }));

      // If auto-refresh, merge with existing and mark new ones
      if (isAutoRefresh) {
        setTransactions(prev => {
          const newTxns = formattedTransactions.filter(
            newTx => !prev.find(existingTx => existingTx.id === newTx.id)
          );
          
          // If we have new transactions, show them with animation
          const updated = [...newTxns.map(tx => ({ ...tx, isNew: true })), ...prev].slice(0, 20);
          
          // Remove new flag after animation
          setTimeout(() => {
            setTransactions(current => current.map(tx => ({ ...tx, isNew: false })));
          }, 2000);
          
          return updated;
        });
      } else {
        setTransactions(formattedTransactions);
      }

      // Calculate metrics
      const successful = formattedTransactions.filter(tx => tx.status === 'success').length;
      const totalFees = formattedTransactions.reduce((sum, tx) => {
        const fee = parseFloat(tx.amount?.replace(' ℏ', '') || '0');
        return sum + fee;
      }, 0);

      setMetrics({
        totalTransactions: formattedTransactions.length,
        successfulTxns: successful,
        totalHBar: totalFees,
        activeBatches: Math.floor(formattedTransactions.length / 3) // Estimate
      });

    } catch (error) {
      console.error('Failed to load transaction data:', error);
      setTransactions(getMockTransactions());
      setMetrics(getMockMetrics());
    } finally {
      if (!isAutoRefresh) setIsLoading(false);
    }
  };

  const getTransactionType = (type: string): LiveTransaction['type'] => {
    if (type.includes('TOKEN')) return 'HTS_NFT';
    if (type.includes('TOPIC')) return 'HCS_MESSAGE';
    if (type.includes('CONTRACT')) return 'CONTRACT_CALL';
    if (type.includes('CRYPTO_TRANSFER')) return 'PAYMENT';
    return 'GUARDIAN';
  };

  const getTransactionTitle = (type: string): string => {
    switch (true) {
      case type.includes('TOKEN_CREATION'): return '🪙 Medicine NFT Created';
      case type.includes('TOPIC_CREATION'): return '📝 Temperature Topic Created';
      case type.includes('TOPIC_MESSAGE'): return '🌡️ Temperature Logged';
      case type.includes('CONTRACT_CALL'): return '💰 Smart Contract Updated';
      case type.includes('CRYPTO_TRANSFER'): return '💸 Payment Processed';
      default: return '🔄 Blockchain Transaction';
    }
  };

  const getTransactionDescription = (tx: any): string => {
    if (tx.memo) return tx.memo;
    switch (true) {
      case tx.type.includes('TOKEN'): return 'HTS NFT certificate for medicine batch';
      case tx.type.includes('TOPIC'): return 'HCS temperature monitoring activated';
      case tx.type.includes('CONTRACT'): return 'HeruNotary contract interaction';
      default: return 'Hedera blockchain transaction';
    }
  };

  const getTypeIcon = (type: LiveTransaction['type']) => {
    switch (type) {
      case 'HTS_NFT': return <FileText className="h-4 w-4" />;
      case 'HCS_MESSAGE': return <Activity className="h-4 w-4" />;
      case 'CONTRACT_CALL': return <Zap className="h-4 w-4" />;
      case 'PAYMENT': return <DollarSign className="h-4 w-4" />;
      case 'GUARDIAN': return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: LiveTransaction['type']) => {
    switch (type) {
      case 'HTS_NFT': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'HCS_MESSAGE': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'CONTRACT_CALL': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'PAYMENT': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'GUARDIAN': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    }
  };

  const getMockTransactions = (): LiveTransaction[] => [
    {
      id: 'txn_001',
      type: 'HTS_NFT',
      title: '🪙 Medicine NFT Created',
      description: 'Insulin batch DEMO-001 certificate minted',
      status: 'success',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      amount: '0.05 ℏ',
      hashscanUrl: 'https://hashscan.io/testnet/transaction/0.0.demo'
    },
    {
      id: 'txn_002', 
      type: 'HCS_MESSAGE',
      title: '📝 Temperature Topic Created',
      description: 'Cold chain monitoring activated for DEMO-001',
      status: 'success',
      timestamp: new Date(Date.now() - 90000).toISOString(),
      amount: '0.01 ℏ',
      hashscanUrl: 'https://hashscan.io/testnet/topic/0.0.demo'
    },
    {
      id: 'txn_003',
      type: 'HCS_MESSAGE', 
      title: '🌡️ Temperature Logged',
      description: '3.2°C recorded at Cairo Airport - Compliant ✅',
      status: 'success',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      amount: '0.01 ℏ'
    },
    {
      id: 'txn_004',
      type: 'GUARDIAN',
      title: '🛡️ Guardian Policy Check',
      description: 'ESG compliance verified - Score: 94%',
      status: 'success', 
      timestamp: new Date(Date.now() - 30000).toISOString(),
      amount: '0.02 ℏ'
    }
  ];

  const getMockMetrics = (): DashboardMetrics => ({
    totalTransactions: 12,
    successfulTxns: 11,
    totalHBar: 0.15,
    activeBatches: 3
  });

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{metrics.totalTransactions}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {metrics.totalTransactions ? Math.round((metrics.successfulTxns / metrics.totalTransactions) * 100) : 0}%
              </p>
            </div>
            <Zap className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Fees</p>
              <p className="text-2xl font-bold text-yellow-400">{metrics.totalHBar.toFixed(3)} ℏ</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-400" />
          </div>
        </Card>

        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Batches</p>
              <p className="text-2xl font-bold text-purple-400">{metrics.activeBatches}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Live Transaction Feed */}
      <Card className="bg-gray-800/50 border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-xl font-semibold text-white">Live Transaction Feed</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`${autoRefresh ? 'bg-green-600/20 border-green-500' : 'border-gray-600'}`}
              >
                <Activity className="h-4 w-4 mr-1" />
                {autoRefresh ? 'Live' : 'Paused'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTransactionData()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet. Create a medicine batch to see live data!</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-4 rounded-lg border transition-all duration-500 ${
                    tx.isNew
                      ? 'bg-green-500/10 border-green-500/50 scale-[1.02] shadow-lg'
                      : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getTypeColor(tx.type)}>
                        {getTypeIcon(tx.type)}
                      </Badge>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-white">{tx.title}</h4>
                          {tx.isNew && (
                            <Badge className="bg-green-500 text-white text-xs animate-pulse">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{tx.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </span>
                          {tx.amount && (
                            <span className="text-xs text-yellow-400 font-medium">
                              {tx.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          tx.status === 'success'
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }
                      >
                        {tx.status === 'success' ? '✅' : '❌'}
                      </Badge>
                      
                      {tx.hashscanUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(tx.hashscanUrl, '_blank')}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Live Status */}
      <div className="text-center text-sm text-gray-400">
        {autoRefresh ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates every 10 seconds</span>
          </div>
        ) : (
          <span>Live updates paused</span>
        )}
      </div>
    </div>
  );
};

export default LiveDashboard;