import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Truck,
  Building2,
  Hospital,
  Thermometer,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Activity,
  TrendingUp,
  Users,
  Beaker
} from 'lucide-react';
import { medicineBatchFlowService, CompleteMedicineBatch, BatchLifecycle } from '../services/medicineBatchFlowService';

const MedicineFlowDashboard: React.FC = () => {
  const [batches, setBatches] = useState<CompleteMedicineBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<CompleteMedicineBatch | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Load initial data
    setBatches(medicineBatchFlowService.getAllBatches());
    setStats(medicineBatchFlowService.getComplianceStats());
    
    // Set initial selected batch
    const allBatches = medicineBatchFlowService.getAllBatches();
    if (allBatches.length > 0) {
      setSelectedBatch(allBatches[0]);
    }
  }, []);

  const getStageIcon = (stage: BatchLifecycle['stage']) => {
    switch (stage) {
      case 'manufacturing': return <Building2 className="h-5 w-5" />;
      case 'transport': return <Truck className="h-5 w-5" />;
      case 'pharmacy': return <Package className="h-5 w-5" />;
      case 'dispensed': return <Hospital className="h-5 w-5" />;
      case 'recalled': return <AlertTriangle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStageColor = (stage: BatchLifecycle['stage']) => {
    switch (stage) {
      case 'manufacturing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'transport': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pharmacy': return 'bg-green-100 text-green-800 border-green-200';
      case 'dispensed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'recalled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'VIOLATION': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStageProgress = (currentStage: BatchLifecycle['stage']) => {
    const stages = ['manufacturing', 'transport', 'pharmacy', 'dispensed'];
    const currentIndex = stages.indexOf(currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicine Flow Dashboard</h2>
          <p className="text-gray-600">Complete pharmaceutical supply chain tracking</p>
        </div>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Batches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compliant</p>
                  <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Violations</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.violations}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compliance Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.complianceRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batches.map((batch) => (
                <div
                  key={batch.batchNumber}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBatch?.batchNumber === batch.batchNumber
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBatch(batch)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{batch.medicine.name}</h4>
                      <p className="text-xs text-gray-600 font-mono">{batch.batchNumber}</p>
                    </div>
                    {getComplianceIcon(batch.complianceStatus)}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getStageColor(batch.currentStage)}>
                      {getStageIcon(batch.currentStage)}
                      <span className="ml-1">{batch.currentStage}</span>
                    </Badge>
                  </div>

                  <Progress value={getStageProgress(batch.currentStage)} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Batch Details */}
        <div className="lg:col-span-2">
          {selectedBatch ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
                <TabsTrigger value="coldchain">Cold Chain</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {selectedBatch.medicine.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Batch Number</p>
                        <p className="font-mono font-medium">{selectedBatch.batchNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Lot Number</p>
                        <p className="font-mono font-medium">{selectedBatch.lotNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Manufacturing Date</p>
                        <p className="font-medium">{selectedBatch.manufacturingDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expiry Date</p>
                        <p className="font-medium">{selectedBatch.expiryDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{selectedBatch.quantity.toLocaleString()} units</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Location</p>
                        <p className="text-sm">{selectedBatch.currentLocation}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Blockchain Information</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-600">HTS Token ID:</p>
                          <p className="font-mono">{selectedBatch.htsTokenId}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">HCS Topic ID:</p>
                          <p className="font-mono">{selectedBatch.hcsTopicId || 'Not assigned'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Supply Chain Actors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedBatch.supplyChainActors.map((actor, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 border rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{actor.name}</p>
                            <p className="text-xs text-gray-600">{actor.action}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {actor.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lifecycle" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Supply Chain Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedBatch.lifecycle.map((stage, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                            index === selectedBatch.lifecycle.length - 1 
                              ? 'bg-blue-100 border-blue-500' 
                              : 'bg-green-100 border-green-500'
                          }`}>
                            {getStageIcon(stage.stage)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium capitalize">{stage.stage}</h4>
                              {index === selectedBatch.lifecycle.length - 1 && (
                                <Badge variant="outline" className="text-xs">Current</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{stage.actor}</p>
                            <p className="text-sm text-gray-800">{stage.notes}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(stage.timestamp).toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {stage.location.split(',')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coldchain" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      Temperature Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedBatch.medicine.requiresColdChain ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-blue-50 rounded">
                            <p className="text-sm text-gray-600">Required Range</p>
                            <p className="font-semibold">
                              {selectedBatch.medicine.tempRange.min}°C to {selectedBatch.medicine.tempRange.max}°C
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 rounded">
                            <p className="text-sm text-gray-600">Readings</p>
                            <p className="font-semibold">{selectedBatch.temperatureReadings.length}</p>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded">
                            <p className="text-sm text-gray-600">Violations</p>
                            <p className="font-semibold">
                              {selectedBatch.temperatureReadings.filter(r => !r.isCompliant).length}
                            </p>
                          </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                          <div className="space-y-2">
                            {selectedBatch.temperatureReadings.slice(-10).reverse().map((reading, index) => (
                              <div
                                key={index}
                                className={`flex items-center justify-between p-2 rounded border ${
                                  reading.isCompliant ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                }`}
                              >
                                <div>
                                  <p className="text-sm font-mono">
                                    {reading.temperature}°C
                                    {reading.humidity && `, ${reading.humidity}% RH`}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(reading.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {reading.isCompliant ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>This medicine doesn't require cold chain monitoring</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="h-5 w-5" />
                      Quality Control Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedBatch.qualityTests.map((test, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded border ${
                            test.result === 'PASS' ? 'border-green-200 bg-green-50' :
                            test.result === 'FAIL' ? 'border-red-200 bg-red-50' :
                            'border-yellow-200 bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{test.testType}</h4>
                            <Badge
                              className={
                                test.result === 'PASS' ? 'bg-green-100 text-green-800' :
                                test.result === 'FAIL' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {test.result}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{test.notes}</p>
                          <p className="text-xs text-gray-500">
                            Tested: {new Date(test.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-gray-500">Select a batch to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineFlowDashboard;