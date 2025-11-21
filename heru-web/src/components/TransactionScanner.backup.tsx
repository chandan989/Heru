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
  const [medicineBatches, setMedicineBatches] = useState<MedicineBatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
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

    const demoTransactions: Transaction[] = [
      {
        id: 'tx_001',
        type: 'NFT_CREATE',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        status: 'SUCCESS',
        details: {
          tokenId: '0.0.12345',
          batchNumber: 'BATCH_001',
          transactionId: '0.0.12345@1642519200.123456789'
        }
      },
      {
        id: 'tx_002',
        type: 'GUARDIAN_VC',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        status: 'SUCCESS',
        details: {
          vcId: 'vc_12345',
          batchNumber: 'BATCH_001'
        }
      },
      {
        id: 'tx_003',
        type: 'FILE_CREATE',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'SUCCESS',
        details: {
          fileId: '0.0.98765',
          batchNumber: 'BATCH_002'
        }
      }
    ];

    setMedicineBatches(demoBatches);
    setTransactions(demoTransactions);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.details.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.details.tokenId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBatches = medicineBatches.filter(batch =>
    batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.tokenId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction Scanner</h2>
          <p className="text-gray-600">Monitor blockchain transactions and medicine batches</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsScanning(!isScanning);
              if (!isScanning) loadDemoData();
            }}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search transactions, batches, or token IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medicine Batches</p>
                <p className="text-2xl font-bold text-gray-900">{medicineBatches.length}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified Batches</p>
                <p className="text-2xl font-bold text-green-600">
                  {medicineBatches.filter(b => b.status === 'VERIFIED').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {medicineBatches.filter(b => b.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="batches">Medicine Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{tx.type.replace('_', ' ')}</p>
                            <Badge className={getStatusColor(tx.status)}>
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <p>ID: {tx.id}</p>
                            {tx.details.batchNumber && (
                              <p>Batch: {tx.details.batchNumber}</p>
                            )}
                            {tx.details.tokenId && (
                              <p>Token: {tx.details.tokenId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                        <Button variant="ghost" size="sm" className="mt-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No transactions found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBatches.length > 0 ? (
                  filteredBatches.map((batch) => (
                    <Card key={batch.batchNumber} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{batch.productName}</h3>
                            <p className="text-sm text-gray-600 font-mono">{batch.batchNumber}</p>
                          </div>
                          {getStatusIcon(batch.status)}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Token ID:</span>
                            <span className="font-mono text-xs">{batch.tokenId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Manufacturing:</span>
                            <span>{batch.manufacturingDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expiry:</span>
                            <span>{batch.expiryDate}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.open(batch.verificationUrl, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Verify
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedBatch(batch)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No medicine batches found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionScanner;