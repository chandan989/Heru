/**
 * Real-Time Storage Performance Dashboard
 * Shows live comparison: Hedera vs Ethereum vs MongoDB
 * NO DEMO DATA - Real metrics only
 */

import React, { useState, useEffect, useCallback } from 'react';
import { dataStorageComparisonService, type RealTimeComparison } from '../services/dataStorageComparisonService';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

export const StoragePerformanceDashboard: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] = useState<RealTimeComparison | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [storageComparison, setStorageComparison] = useState<any>(null);

  // Particles configuration
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    fullScreen: {
      enable: false,
      zIndex: 1
    },
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: "#9900ff"
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: 0.5,
        random: true
      },
      size: {
        value: 3,
        random: true
      },
      links: {
        enable: false
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: "none" as const,
        random: true,
        straight: false,
        outModes: {
          default: "out" as const
        }
      }
    },
    interactivity: {
      detectsOn: "canvas" as const,
      events: {
        onHover: {
          enable: true,
          mode: "bubble"
        },
        resize: true
      },
      modes: {
        bubble: {
          distance: 200,
          size: 5,
          duration: 2,
          opacity: 0.8
        }
      }
    },
    detectRetina: true
  };

  useEffect(() => {
    // Start real-time monitoring
    dataStorageComparisonService.startRealTimeMonitoring();
    setIsMonitoring(true);

    // Update dashboard every 5 seconds
    const interval = setInterval(() => {
      const metrics = dataStorageComparisonService.getCurrentComparison();
      const summary = dataStorageComparisonService.getStorageComparisonSummary();
      
      setCurrentMetrics(metrics);
      setStorageComparison(summary);
    }, 5000);

    return () => {
      clearInterval(interval);
      dataStorageComparisonService.stopRealTimeMonitoring();
    };
  }, []);

  const formatCurrency = (value: number) => `${value.toFixed(6)}`;
  const formatLatency = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
  const formatTPS = (tps: number) => `${tps.toLocaleString()} TPS`;

  return (
    <div className="min-h-screen bg-black text-foreground overflow-x-hidden">
      {/* Particles Background */}
      <div className="fixed inset-0 z-[1]">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
          className="w-full h-full"
        />
      </div>

      <div className="relative z-[2] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">
              Real-Time Metrics
            </h1>
            <p className="text-xl text-gray-300 mt-2">
              Storage Performance Dashboard
            </p>
            <div className="mt-4 flex justify-center items-center space-x-4">
              <div className={`flex items-center space-x-2 ${isMonitoring ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {isMonitoring ? 'LIVE MONITORING ACTIVE' : 'MONITORING OFFLINE'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Metrics Comparison */}
          {currentMetrics && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Hedera Performance */}
              <div className="bg-card/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">🌟 Hedera Network</h3>
                  <span className="text-green-400 text-sm font-medium">PRIMARY STORAGE</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Latency:</span>
                    <span className="font-mono text-green-400 font-semibold">
                      {formatLatency(currentMetrics.hederaMetrics.averageLatency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Throughput:</span>
                    <span className="font-mono text-green-400 font-semibold">
                      {formatTPS(currentMetrics.hederaMetrics.throughputTPS)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cost/Transaction:</span>
                    <span className="font-mono text-green-400 font-semibold">
                      {formatCurrency(currentMetrics.hederaMetrics.costPerTransaction)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Finality:</span>
                    <span className="font-mono text-green-400 font-semibold">
                      {currentMetrics.hederaMetrics.finality}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Energy/Tx:</span>
                    <span className="font-mono text-green-400 font-semibold">
                      {currentMetrics.hederaMetrics.energyEfficiency} kWh
                    </span>
                  </div>
                </div>
              </div>

              {/* MongoDB Performance */}
              <div className="bg-card/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">🛡️ MongoDB Guardian</h3>
                  <span className="text-blue-400 text-sm font-medium">POLICY ENGINE</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Query Time:</span>
                    <span className="font-mono text-blue-400 font-semibold">
                      {currentMetrics.mongoDbMetrics.averageLatency}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Operations/Sec:</span>
                    <span className="font-mono text-blue-400 font-semibold">
                      {currentMetrics.mongoDbMetrics.throughputTPS.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cost/Operation:</span>
                    <span className="font-mono text-blue-400 font-semibold">
                      {formatCurrency(currentMetrics.mongoDbMetrics.costPerTransaction)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Consistency:</span>
                    <span className="font-mono text-blue-400 font-semibold">
                      Immediate
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Uptime:</span>
                    <span className="font-mono text-blue-400 font-semibold">
                      {currentMetrics.mongoDbMetrics.uptime}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Ethereum Comparison */}
              <div className="bg-card/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">⚠️ Ethereum Network</h3>
                  <span className="text-red-400 text-sm font-medium">COMPARISON ONLY</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Latency:</span>
                    <span className="font-mono text-red-400 font-semibold">
                      {formatLatency(currentMetrics.ethereumMetrics.averageLatency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Throughput:</span>
                    <span className="font-mono text-red-400 font-semibold">
                      {formatTPS(currentMetrics.ethereumMetrics.throughputTPS)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cost/Transaction:</span>
                    <span className="font-mono text-red-400 font-semibold">
                      {formatCurrency(currentMetrics.ethereumMetrics.costPerTransaction)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Finality:</span>
                    <span className="font-mono text-red-400 font-semibold">
                      {currentMetrics.ethereumMetrics.finality}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Energy/Tx:</span>
                    <span className="font-mono text-red-400 font-semibold">
                      {currentMetrics.ethereumMetrics.energyEfficiency} kWh
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Advantages */}
          {currentMetrics && (
            <div className="bg-card/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                🚀 Hedera Performance Advantages Over Ethereum
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-400">
                    {currentMetrics.performanceAdvantage.speedImprovement}
                  </div>
                  <div className="text-gray-300 mt-1">Faster Finality</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-400">
                    {currentMetrics.performanceAdvantage.costReduction}
                  </div>
                  <div className="text-gray-300 mt-1">Cost Reduction</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-400">
                    {currentMetrics.performanceAdvantage.energyEfficiency}
                  </div>
                  <div className="text-gray-300 mt-1">Energy Efficient</div>
                </div>
              </div>
            </div>
          )}

          {/* Live IoT Monitoring */}
          {currentMetrics && (
            <div className="bg-card/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                📡 Real-Time IoT Sensor Network
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-400">
                    {currentMetrics.liveIoTData.sensorsActive}
                  </div>
                  <div className="text-gray-300 text-sm">Active Sensors</div>
                </div>
                <div className="text-center p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400">
                    {currentMetrics.liveIoTData.readingsPerSecond.toFixed(1)}
                  </div>
                  <div className="text-gray-300 text-sm">Readings/Second</div>
                </div>
                <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">
                    {currentMetrics.liveIoTData.temperatureViolations}
                  </div>
                  <div className="text-gray-300 text-sm">Violations</div>
                </div>
                <div className="text-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-400">
                    {currentMetrics.liveIoTData.dataIntegrity.toFixed(1)}%
                  </div>
                  <div className="text-gray-300 text-sm">Data Integrity</div>
                </div>
              </div>
            </div>
          )}

          {/* Storage Architecture Overview */}
          {storageComparison && (
            <div className="bg-card/20 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                🏗️ Pharmaceutical Data Storage Architecture
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-green-500/30 bg-green-500/5 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">Hedera Primary Storage</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• HCS Topics: Real-time IoT data</li>
                    <li>• HTS NFTs: Medicine batch tokens</li>
                    <li>• 3-5s finality guarantee</li>
                    <li>• $0.0001 per transaction</li>
                    <li>• 99.99% network uptime</li>
                  </ul>
                </div>
                <div className="border border-blue-500/30 bg-blue-500/5 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">MongoDB Guardian Engine</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Policy compliance verification</li>
                    <li>• Temperature violation tracking</li>
                    <li>• Audit trail management</li>
                    <li>• Sub-second query performance</li>
                    <li>• ACID transaction guarantees</li>
                  </ul>
                </div>
                <div className="border border-purple-500/30 bg-purple-500/5 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-400 mb-2">Integrated Advantages</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Real-time cold chain monitoring</li>
                    <li>• Immutable pharmaceutical records</li>
                    <li>• Instant compliance verification</li>
                    <li>• Low-cost African deployment</li>
                    <li>• Enterprise-grade reliability</li>
                  </ul>
                </div>
              </div>
              
              {storageComparison.mongoDbStatus && (
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h5 className="font-semibold text-white mb-2">MongoDB Connection Status</h5>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300">Connected: {storageComparison.mongoDbStatus.url}</span>
                    </span>
                    <span className="text-gray-300">Collections: {storageComparison.mongoDbStatus.collections.length}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Real-time monitoring • No demo data • Production-ready pharmaceutical anti-counterfeiting</p>
            <p className="mt-1">Powered by Hedera Hashgraph • Guardian Compliance • MongoDB Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoragePerformanceDashboard;