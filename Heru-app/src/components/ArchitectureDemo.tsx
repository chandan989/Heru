import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Database, 
  DollarSign, 
  CheckCircle, 
  TrendingUp, 
  Shield,
  Clock,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { hederaNativeService } from '@/services/hederaNativeService';

interface ArchitectureMetrics {
  oldApproach: {
    maxReadings: number;
    costPerReading: string;
    gasUsed: string;
    updateFlexibility: string;
    scalability: string;
  };
  newApproach: {
    maxReadings: string;
    costPerReading: string;
    hcsMessages: string;
    updateFlexibility: string;
    scalability: string;
  };
}

export const ArchitectureDemo: React.FC = () => {
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [temperatureCount, setTemperatureCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [htsTokenId, setHtsTokenId] = useState<string>('');
  const [hcsTopicId, setHcsTopicId] = useState<string>('');

  const metrics: ArchitectureMetrics = {
    oldApproach: {
      maxReadings: 10,
      costPerReading: '$2.50 (gas)',
      gasUsed: '~50,000 gas',
      updateFlexibility: 'Contract redeploy required',
      scalability: '❌ Hits gas limits'
    },
    newApproach: {
      maxReadings: 'Unlimited ∞',
      costPerReading: '$0.01 (HCS)',
      hcsMessages: '~1,000 bytes',
      updateFlexibility: 'Guardian policy update',
      scalability: '✅ Enterprise scale'
    }
  };

  const runArchitectureDemo = async () => {
    setIsRunningDemo(true);
    setDemoStep(0);
    setTemperatureCount(0);
    setTotalCost(0);

    try {
      // Step 1: Create HTS NFT
      setDemoStep(1);
      const batchData = {
        id: `demo-${Date.now()}`,
        medicine: 'COVID-19 Vaccines (Demo)',
        batchNumber: 'DEMO-2024-001',
        quantity: '500 doses',
        manufacturer: 'Demo Pharma Ltd',
        destination: 'Cairo Medical Center',
        tempMin: 2,
        tempMax: 8,
        guardianName: 'Dr. Demo Guardian',
        guardianContact: '+20 100 000 0000',
        timestamp: new Date().toISOString(),
        medicineType: 'vaccine' as const,
        expiryDate: '2024-12-31',
        manufacturingDate: '2024-01-15'
      };

      const tokenId = await hederaNativeService.createMedicineBatchNFT(batchData);
      setHtsTokenId(tokenId);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Create HCS Topic
      setDemoStep(2);
      const topicId = await hederaNativeService.createTemperatureDataTopic(batchData.id);
      setHcsTopicId(topicId);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Simulate scalable temperature logging
      setDemoStep(3);
      
      // Simulate logging many temperature readings (what would break the old approach)
      const locations = [
        'Alexandria Factory',
        'Highway KM-50',
        'Highway KM-100', 
        'Highway KM-150',
        'Cairo Distribution',
        'Local Pharmacy 1',
        'Local Pharmacy 2',
        'Rural Clinic A',
        'Rural Clinic B',
        'Final Hospital'
      ];

      for (let i = 0; i < 50; i++) { // 50 readings - would cost $125 in old approach!
        const reading = {
          batchId: batchData.id,
          temperature: 3.5 + (Math.random() * 2), // 3.5-5.5°C
          humidity: 60 + Math.random() * 10,
          location: locations[i % locations.length],
          timestamp: new Date(Date.now() + i * 10000).toISOString(),
          sensorId: `DEMO-SENSOR-${String(i).padStart(3, '0')}`,
          complianceStatus: 'compliant' as const,
          alertTriggered: false,
          carbonImpact: Math.random() * 0.1
        };

        await hederaNativeService.logTemperatureReading(reading);
        setTemperatureCount(i + 1);
        setTotalCost((i + 1) * 0.01); // $0.01 per HCS message
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Fast demo
      }

      // Step 4: Show final results
      setDemoStep(4);

    } catch (error) {
      console.error('Demo error:', error);
    } finally {
      setIsRunningDemo(false);
    }
  };

  const getDemoStepInfo = () => {
    switch (demoStep) {
      case 1:
        return {
          title: '🪙 Creating HTS NFT',
          description: 'Using native Hedera Token Service (not ERC721 smart contract)',
          color: 'bg-blue-500'
        };
      case 2:
        return {
          title: '📝 Creating HCS Topic',
          description: 'Dedicated topic for unlimited temperature data logging',
          color: 'bg-green-500'
        };
      case 3:
        return {
          title: '🌡️ Logging Temperature Data',
          description: 'Demonstrating scalable, cheap data logging',
          color: 'bg-purple-500'
        };
      case 4:
        return {
          title: '✅ Demo Complete',
          description: 'Architecture advantages demonstrated',
          color: 'bg-emerald-500'
        };
      default:
        return {
          title: '🚀 Ready to Demo',
          description: 'Click to see the architecture in action',
          color: 'bg-gray-500'
        };
    }
  };

  const stepInfo = getDemoStepInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🏆 Hedera-Native Architecture Demo
          </h1>
          <p className="text-xl text-gray-300">
            Why this approach wins hackathons: Scalable, Cheap, and Flexible
          </p>
        </motion.div>

        {/* Architecture Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Old Approach */}
          <Card className="p-6 bg-red-900/20 border-red-500/30">
            <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center">
              ❌ Old Approach (Ethereum-Style)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Max Readings:</span>
                <Badge variant="destructive">{metrics.oldApproach.maxReadings}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Cost per Reading:</span>
                <span className="text-red-300">{metrics.oldApproach.costPerReading}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Gas Usage:</span>
                <span className="text-red-300">{metrics.oldApproach.gasUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Updates:</span>
                <span className="text-red-300">{metrics.oldApproach.updateFlexibility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Scalability:</span>
                <span className="text-red-300">{metrics.oldApproach.scalability}</span>
              </div>
            </div>
          </Card>

          {/* New Approach */}
          <Card className="p-6 bg-green-900/20 border-green-500/30">
            <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center">
              ✅ New Approach (Hedera-Native)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Max Readings:</span>
                <Badge variant="default" className="bg-green-600">{metrics.newApproach.maxReadings}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Cost per Reading:</span>
                <span className="text-green-300">{metrics.newApproach.costPerReading}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">HCS Messages:</span>
                <span className="text-green-300">{metrics.newApproach.hcsMessages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Updates:</span>
                <span className="text-green-300">{metrics.newApproach.updateFlexibility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Scalability:</span>
                <span className="text-green-300">{metrics.newApproach.scalability}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Live Demo */}
        <Card className="p-8 bg-gray-800/50 border-gray-700">
          <div className="text-center mb-6">
            <div className={`inline-block px-4 py-2 rounded-full ${stepInfo.color} text-white mb-4`}>
              {stepInfo.title}
            </div>
            <p className="text-gray-300">{stepInfo.description}</p>
          </div>

          {/* Demo Metrics */}
          {demoStep > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{htsTokenId ? '1' : '0'}</div>
                <div className="text-sm text-gray-400">HTS NFTs Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{hcsTopicId ? '1' : '0'}</div>
                <div className="text-sm text-gray-400">HCS Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{temperatureCount}</div>
                <div className="text-sm text-gray-400">Temperature Readings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">${totalCost.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Total Cost</div>
              </div>
            </div>
          )}

          {/* Cost Comparison */}
          {temperatureCount > 10 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg p-4 mb-6 border border-green-500/30"
            >
              <h4 className="text-lg font-semibold text-white mb-2">💰 Cost Savings Demonstrated</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-red-300">Old Approach Cost:</span>
                  <div className="text-2xl font-bold text-red-400">${(temperatureCount * 2.5).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-green-300">New Approach Cost:</span>
                  <div className="text-2xl font-bold text-green-400">${totalCost.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="text-xl font-bold text-yellow-400">
                  💸 Savings: ${((temperatureCount * 2.5) - totalCost).toFixed(2)} 
                  ({Math.round(((temperatureCount * 2.5 - totalCost) / (temperatureCount * 2.5)) * 100)}% cheaper!)
                </span>
              </div>
            </motion.div>
          )}

          {/* Demo Controls */}
          <div className="text-center">
            <Button
              onClick={runArchitectureDemo}
              disabled={isRunningDemo}
              size="lg"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isRunningDemo ? (
                <>
                  <Clock className="animate-spin mr-2" />
                  Running Demo...
                </>
              ) : (
                <>
                  <Zap className="mr-2" />
                  Run Architecture Demo
                </>
              )}
            </Button>
          </div>

          {/* Technical Details */}
          {demoStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-600"
            >
              <h4 className="text-lg font-semibold text-white mb-4">🔧 Technical Architecture</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-300 mb-2">🪙 Hedera Token Service (HTS)</h5>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Native NFT creation (not ERC721)</li>
                    <li>• Built-in metadata support</li>
                    <li>• Lower gas costs</li>
                    <li>• Enterprise-grade performance</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-green-300 mb-2">📝 Hedera Consensus Service (HCS)</h5>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Unlimited data logging</li>
                    <li>• $0.01 per message</li>
                    <li>• Real-time streaming</li>
                    <li>• Cryptographic audit trail</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-purple-900/30 rounded border border-purple-500/50">
                <h5 className="font-medium text-purple-300 mb-2">🛡️ Guardian Integration</h5>
                <p className="text-gray-300">
                  Off-chain policy validation reads HCS data and triggers smart contract actions.
                  No gas costs for complex business logic. Policies easily updated without contract redeployment.
                </p>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
};