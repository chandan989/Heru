import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { heruContractService } from '@/services/heruContractService';
import { Shield, Lock, Unlock, Leaf, Zap, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function SmartContractDashboard() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    loadContractInfo();
  }, []);

  const loadContractInfo = () => {
    const info = heruContractService.getContractInfo();
    setContractInfo(info);
    setIsInitialized(info.isInitialized);
  };

  const initializeContract = async () => {
    setIsInitializing(true);
    setTestResults(prev => [...prev, '🔗 Initializing contract service...']);
    
    try {
      const success = await heruContractService.initialize();
      if (success) {
        setIsInitialized(true);
        setTestResults(prev => [...prev, '✅ Contract service initialized successfully!']);
        loadContractInfo();
      } else {
        setTestResults(prev => [...prev, '❌ Failed to initialize - check credentials']);
      }
    } catch (error: any) {
      setTestResults(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setIsInitializing(false);
    }
  };

  const testAIAlert = async () => {
    setTestResults(prev => [...prev, '🤖 Testing AI Alert feature...']);
    try {
      const txId = await heruContractService.triggerAIAlert({
        batchId: 'TEST-BATCH-001',
        spoilageRisk: 75,
        alertType: 'TEMPERATURE',
        freezeDurationMinutes: 30
      });
      setTestResults(prev => [...prev, `✅ AI Alert triggered! TX: ${txId}`]);
    } catch (error: any) {
      setTestResults(prev => [...prev, `❌ AI Alert failed: ${error.message}`]);
    }
  };

  const testAcknowledgeAlert = async () => {
    setTestResults(prev => [...prev, '✅ Testing Alert Acknowledgment...']);
    try {
      const txId = await heruContractService.acknowledgeAlert('TEST-BATCH-001');
      setTestResults(prev => [...prev, `✅ Alert acknowledged! TX: ${txId}`]);
    } catch (error: any) {
      setTestResults(prev => [...prev, `❌ Acknowledge failed: ${error.message}`]);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Smart Contract Dashboard</h1>
          <p className="text-gray-400 mt-2">Monitor and test HeruEnhanced smart contract</p>
        </div>
        <Badge variant={isInitialized ? "default" : "destructive"} className="text-lg px-4 py-2">
          {isInitialized ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Connected</>
          ) : (
            <><XCircle className="w-4 h-4 mr-2" /> Not Connected</>
          )}
        </Badge>
      </div>

      {/* Contract Info Card */}
      <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30 p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-purple-400" />
          Contract Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Contract ID</p>
            <p className="text-white font-mono text-lg">{contractInfo?.contractId || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Contract Address</p>
            <p className="text-white font-mono text-sm">{contractInfo?.contractAddress || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Network</p>
            <p className="text-white font-bold">{contractInfo?.network || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <Badge variant={contractInfo?.isInitialized ? "default" : "secondary"}>
              {contractInfo?.isInitialized ? 'Initialized' : 'Not Initialized'}
            </Badge>
          </div>
        </div>

        {contractInfo?.explorerUrl && (
          <div className="mt-4">
            <a 
              href={contractInfo.explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              View on HashScan <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        )}
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30 p-6">
          <Lock className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-white font-bold mb-2">Escrow System</h3>
          <p className="text-gray-400 text-sm">Automated payment holding and release based on compliance</p>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/50 to-orange-900/50 border-red-500/30 p-6">
          <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
          <h3 className="text-white font-bold mb-2">AI Alerts</h3>
          <p className="text-gray-400 text-sm">Freeze payments when spoilage risk detected</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30 p-6">
          <Leaf className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-white font-bold mb-2">Carbon Credits</h3>
          <p className="text-gray-400 text-sm">Mint NFTs for eco-friendly deliveries with bonus rewards</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border-yellow-500/30 p-6">
          <Zap className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="text-white font-bold mb-2">DePIN Payments</h3>
          <p className="text-gray-400 text-sm">Automatic micro-payments to IoT sensor operators</p>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="bg-gray-900/50 border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Test Contract Functions</h2>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {!isInitialized && (
            <Button 
              onClick={initializeContract} 
              disabled={isInitializing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isInitializing ? 'Initializing...' : 'Initialize Contract Service'}
            </Button>
          )}
          
          {isInitialized && (
            <>
              <Button 
                onClick={testAIAlert}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Test AI Alert (Freeze Payment)
              </Button>
              
              <Button 
                onClick={testAcknowledgeAlert}
                className="bg-green-600 hover:bg-green-700"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Test Acknowledge Alert
              </Button>
            </>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-bold mb-2">Test Results:</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-sm">
              {testResults.map((result, idx) => (
                <div key={idx} className="text-gray-300">{result}</div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Integration Status */}
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Integration Status</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Smart Contract Deployed</span>
            <Badge variant="default"><CheckCircle2 className="w-4 h-4 mr-1" /> Yes</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Contract Service Created</span>
            <Badge variant="default"><CheckCircle2 className="w-4 h-4 mr-1" /> Yes</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Batch Creation Integration</span>
            <Badge variant="default"><CheckCircle2 className="w-4 h-4 mr-1" /> Yes</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Credentials Configured</span>
            <Badge variant={contractInfo?.isInitialized ? "default" : "secondary"}>
              {contractInfo?.isInitialized ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
              {contractInfo?.isInitialized ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        {isInitialized && (
          <div className="mt-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
            <p className="text-green-300 font-bold">
              ✅ Smart Contract is LIVE and integrated!
            </p>
            <p className="text-green-400 text-sm mt-1">
              When you create a new medicine batch, it will automatically create a shipment on the smart contract with 10 HBAR escrow.
            </p>
          </div>
        )}
        
        {!isInitialized && (
          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-300 font-bold">
              ⚠️ Smart Contract Integration Not Active
            </p>
            <p className="text-yellow-400 text-sm mt-1">
              Click "Initialize Contract Service" to connect to your deployed smart contract.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default SmartContractDashboard;

