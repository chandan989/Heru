import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ExternalLink,
  Package,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'NFT_CREATE' | 'NFT_MINT' | 'FILE_CREATE' | 'CONSENSUS_SUBMIT' | 'GUARDIAN_VC';
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  details: {
    tokenId?: string;
    fileId?: string;
    topicId?: string;
    vcId?: string;
    batchNumber?: string;
    transactionId?: string;
    hash?: string;
  };
  metadata?: any;
}

interface MedicineBatch {
  batchNumber: string;
  tokenId: string;
  nftId: string;
  manufacturerDid: string;
  productName: string;
  manufacturingDate: string;
  expiryDate: string;
  status: 'VERIFIED' | 'PENDING' | 'FAILED';
  transactions: Transaction[];
  guardianVc?: string;
  ipfsHash?: string;
  qrCode?: string;
  verificationUrl?: string;
}

const TransactionScanner: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [medicineBatches, setBatches] = useState<MedicineBatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<MedicineBatch | null>(null);

  // Initialize with real-time data
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      const { transactionMonitoringService } = await import('../services/transactionMonitoringService');
      const realBatches = transactionMonitoringService.getAllBatches();
      setBatches(realBatches);
      
      const realTransactions = transactionMonitoringService.getRecentTransactions(100);
      setTransactions(realTransactions);
      
      console.log('🔄 Loaded real blockchain data:', { batches: realBatches.length, transactions: realTransactions.length });
    } catch (error) {
      console.error('Failed to load real data:', error);
    }
  };

  const refreshData = () => {
    loadRealData();
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleBatchClick = (batch: MedicineBatch) => {
    setSelectedBatch(batch);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'NFT_CREATE':
      case 'NFT_MINT':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'GUARDIAN_VC':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter functions
  const filteredTransactions = transactions.filter(tx =>
    (tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tx.details.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tx.details.tokenId?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === 'all' || tx.type === filterType) &&
    (filterStatus === 'all' || tx.status === filterStatus)
  );

  const filteredBatches = medicineBatches.filter(batch =>
    (batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     batch.tokenId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || batch.status === filterStatus)
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 to-blue-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🔍 Heru Network Scanner
          </h1>
          <p className="text-gray-300 mt-2">Real-time blockchain monitoring | 3-5s finality vs 15s+ Ethereum</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-green-400">⚡ {filteredTransactions.length} transactions tracked</span>
            <span className="text-blue-400">📊 99.9% uptime (Hedera network)</span>
            <span className="text-purple-400">💰 $0.001 avg cost vs $15+ Ethereum</span>
          </div>
        </div>
        <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search transactions, batches, token IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        >
          <option value="all">All Types</option>
          <option value="NFT_CREATE">NFT Creation</option>
          <option value="GUARDIAN_VC">Guardian Credentials</option>
          <option value="CONSENSUS_SUBMIT">HCS Messages</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        >
          <option value="all">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-600">
            <Activity className="h-4 w-4 mr-2" />
            Transactions ({filteredTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="batches" className="data-[state=active]:bg-blue-600">
            <Package className="h-4 w-4 mr-2" />
            Medicine Batches ({filteredBatches.length})
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredTransactions.map((transaction) => (
                <Card 
                  key={transaction.id} 
                  className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-white">{transaction.id}</p>
                          <p className="text-sm text-gray-400">{transaction.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(transaction.status)}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{transaction.status}</span>
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {transaction.details.batchNumber && (
                      <div className="mt-2 text-sm text-gray-300">
                        Batch: {transaction.details.batchNumber}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Transaction Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTransaction ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Transaction ID</p>
                      <p className="text-white font-mono break-all">{selectedTransaction.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Type</p>
                      <Badge className={getStatusColor(selectedTransaction.type)}>
                        {selectedTransaction.type}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <Badge className={getStatusColor(selectedTransaction.status)}>
                        {getStatusIcon(selectedTransaction.status)}
                        <span className="ml-1">{selectedTransaction.status}</span>
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Timestamp</p>
                      <p className="text-white">{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                    </div>
                    
                    {Object.entries(selectedTransaction.details).map(([key, value]) => value && (
                      <div key={key}>
                        <p className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-white font-mono break-all">{value}</p>
                      </div>
                    ))}
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on HashScan
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-400">Select a transaction to view details</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medicine Batches Tab */}
        <TabsContent value="batches">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Batch List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredBatches.map((batch) => (
                <Card 
                  key={batch.batchNumber} 
                  className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => handleBatchClick(batch)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Package className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-white">{batch.batchNumber}</p>
                          <p className="text-sm text-gray-400">{batch.productName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(batch.status)}>
                          {getStatusIcon(batch.status)}
                          <span className="ml-1">{batch.status}</span>
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          Expires: {new Date(batch.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between text-sm text-gray-300">
                      <span>Token: {batch.tokenId}</span>
                      <span>{batch.transactions.length} transactions</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Batch Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Batch Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBatch ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Batch Number</p>
                      <p className="text-white font-mono">{selectedBatch.batchNumber}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Product</p>
                      <p className="text-white">{selectedBatch.productName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Token ID</p>
                      <p className="text-white font-mono">{selectedBatch.tokenId}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <Badge className={getStatusColor(selectedBatch.status)}>
                        {getStatusIcon(selectedBatch.status)}
                        <span className="ml-1">{selectedBatch.status}</span>
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Manufacturing Date</p>
                      <p className="text-white">{new Date(selectedBatch.manufacturingDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Expiry Date</p>
                      <p className="text-white">{new Date(selectedBatch.expiryDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Transactions</p>
                      <p className="text-white">{selectedBatch.transactions.length} recorded</p>
                    </div>
                    
                    {selectedBatch.verificationUrl && (
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Eye className="h-4 w-4 mr-2" />
                        Verify Batch
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">Select a batch to view details</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionScanner;