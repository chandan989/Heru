/**
 * IoT Monitoring Page
 * Dedicated page for viewing IoT sensor data and supply chain tracking
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Thermometer, 
  Activity, 
  MapPin, 
  Truck, 
  ExternalLink,
  Zap,
  Eye
} from 'lucide-react';
import IoTDashboard from '@/components/IoTDashboard';
import { Link } from 'react-router-dom';

const IoTMonitoringPage: React.FC = () => {
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
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                <Thermometer className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                IoT Monitoring Center
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real-time IoT sensor monitoring throughout the medical supply chain journey.
              Track temperature, humidity, GPS, vibration, and more.
            </p>
            
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                IoT Sensors Active
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Real-time Tracking
              </Badge>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Cold Chain Monitoring
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* IoT Features Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="container mx-auto px-4 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gray-800/50 border-gray-700 text-center">
              <Thermometer className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Temperature</h3>
              <p className="text-sm text-gray-400">Cold chain monitoring 2-8°C</p>
            </Card>
            
            <Card className="p-6 bg-gray-800/50 border-gray-700 text-center">
              <Activity className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Real-time Data</h3>
              <p className="text-sm text-gray-400">3-second update intervals</p>
            </Card>
            
            <Card className="p-6 bg-gray-800/50 border-gray-700 text-center">
              <MapPin className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">GPS Tracking</h3>
              <p className="text-sm text-gray-400">Location monitoring</p>
            </Card>
            
            <Card className="p-6 bg-gray-800/50 border-gray-700 text-center">
              <Truck className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Journey Stages</h3>
              <p className="text-sm text-gray-400">End-to-end tracking</p>
            </Card>
          </div>
        </motion.div>

        {/* Main IoT Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="container mx-auto px-4"
        >
          <IoTDashboard />
        </motion.div>

        {/* IoT Architecture Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="container mx-auto px-4 mt-12 mb-8"
        >
          <Card className="p-8 bg-gray-800/50 border-gray-700">
            <h3 className="text-2xl font-semibold text-white mb-6">🔧 IoT Architecture & Sensors</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-red-400" />
                  <h4 className="font-medium text-red-300">Temperature Sensors</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-7">
                  <li>• ±0.1°C accuracy</li>
                  <li>• Real-time alerts for violations</li>
                  <li>• Cold chain compliance (2-8°C)</li>
                  <li>• Battery life: 2+ years</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  <h4 className="font-medium text-blue-300">Environmental Monitoring</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-7">
                  <li>• Humidity monitoring (60-80%)</li>
                  <li>• Light exposure detection</li>
                  <li>• Vibration/shock tracking</li>
                  <li>• Door opening alerts</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <h4 className="font-medium text-green-300">GPS & Location</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-7">
                  <li>• Real-time GPS coordinates</li>
                  <li>• Route optimization</li>
                  <li>• Geofencing alerts</li>
                  <li>• Journey timeline tracking</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <h4 className="font-medium text-yellow-300">Data Integration</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-7">
                  <li>• HCS consensus logging</li>
                  <li>• Guardian policy triggers</li>
                  <li>• Smart contract integration</li>
                  <li>• Mirror Node queries</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-purple-400" />
                  <h4 className="font-medium text-purple-300">Alert System</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-7">
                  <li>• Real-time violation alerts</li>
                  <li>• Automated compliance checks</li>
                  <li>• Guardian policy enforcement</li>
                  <li>• Stakeholder notifications</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-orange-400" />
                  <h4 className="font-medium text-orange-300">Supply Chain Stages</h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 pl-7">
                  <li>• Manufacturing facility</li>
                  <li>• Cold storage packaging</li>
                  <li>• Transport monitoring</li>
                  <li>• Distribution & delivery</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    IoT System Active
                  </Badge>
                  <span className="text-sm text-gray-400">
                    Simulating realistic supply chain journey: Alexandria → Cairo
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link to="/data-dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 hover:border-gray-500"
                    >
                      <Activity className="h-4 w-4 mr-1" />
                      Live Data Dashboard
                    </Button>
                  </Link>
                  
                  <Link to="/create-seal">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 hover:border-gray-500"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Create Medicine Batch
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
            Heru IoT Monitoring • Real-time Sensor Networks • 
            Integrated with Hedera HCS for Immutable Data Logging
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default IoTMonitoringPage;