/**
 * Real-Time Data Dashboard Page
 * Shows live Hedera transactions, HCS messages, and system metrics
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Globe, 
  BarChart3,
  Eye,
  ExternalLink
} from 'lucide-react';
import LiveDashboard from '@/components/LiveDashboard';
import { Link } from 'react-router-dom';

const DataDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 pt-20 pb-8"
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Live Data Dashboard
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real-time view of Hedera blockchain transactions, HCS temperature logs, 
              and medicine supply chain analytics
            </p>
            
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                Live Data
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Hedera Testnet
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                IPFS Storage
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="container mx-auto px-4 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gray-800/50 border-gray-700 text-center">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">99.8% Cost Savings</h3>
              <p className="text-sm text-gray-400">vs Traditional Blockchain</p>
            </Card>
            
            <Card className="p-6 bg-gray-800/50 border-gray-700 text-center">
              <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">$0.01 Per Message</h3>
              <p className="text-sm text-gray-400">HCS Temperature Logs</p>
            </Card>
            
            <Card className="p-6 bg-gray-800/50 border-gray-700 text-center">
              <Globe className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Unlimited Scale</h3>
              <p className="text-sm text-gray-400">HCS Data Logging</p>
            </Card>
            
            <Card className="p-6 bg-gray-800/50 border-gray-700 text-center">
              <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Real-Time ESG</h3>
              <p className="text-sm text-gray-400">Guardian Compliance</p>
            </Card>
          </div>
        </motion.div>

        {/* Live Dashboard Component */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="container mx-auto px-4"
        >
          <LiveDashboard />
        </motion.div>

        {/* Data Sources Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="container mx-auto px-4 mt-12 mb-8"
        >
          <Card className="p-8 bg-gray-800/50 border-gray-700">
            <h3 className="text-2xl font-semibold text-white mb-6">📊 Data Sources & Architecture</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-medium text-blue-300">HTS (Hedera Token Service)</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-5">
                  <li>• Medicine batch NFT certificates</li>
                  <li>• Native token creation (not ERC721)</li>
                  <li>• IPFS metadata integration</li>
                  <li>• Low-cost ownership tracking</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium text-green-300">HCS (Hedera Consensus)</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-5">
                  <li>• Real-time temperature logging</li>
                  <li>• Unlimited message throughput</li>
                  <li>• $0.01 per temperature reading</li>
                  <li>• Immutable audit trail</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h4 className="font-medium text-purple-300">Smart Contracts</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-5">
                  <li>• Payment escrow & release</li>
                  <li>• Compliance verification</li>
                  <li>• Automated settlements</li>
                  <li>• Live at 0.0.6904249</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <h4 className="font-medium text-orange-300">IPFS Storage</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-5">
                  <li>• Decentralized file storage</li>
                  <li>• Medicine certificates & images</li>
                  <li>• Immutable document hashes</li>
                  <li>• Global accessibility</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    All Systems Operational
                  </Badge>
                  <span className="text-sm text-gray-400">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://hashscan.io/testnet', '_blank')}
                    className="border-gray-600 hover:border-gray-500"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View on HashScan
                  </Button>
                  
                  <Link to="/architecture">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 hover:border-gray-500"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Architecture Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="container mx-auto px-4 py-8 text-center"
        >
          <p className="text-gray-400">
            Heru Medical Supply Chain • Built on Hedera Hashgraph • 
            Powered by HTS + HCS + Guardian + IPFS
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DataDashboard;