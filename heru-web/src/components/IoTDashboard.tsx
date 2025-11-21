/**
 * IoT Monitoring Dashboard Component
 * Real-time visualization of IoT sensor data throughout the supply chain
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Thermometer, 
  Droplets, 
  MapPin, 
  Zap, 
  Eye, 
  Battery,
  Signal,
  AlertTriangle,
  CheckCircle,
  Truck,
  Building,
  Play,
  Pause
} from 'lucide-react';
import { iotSimulationService } from '@/services/iotSimulationService';
import type { SupplyChainJourney } from '@/services/iotSimulationService';

interface IoTDashboardProps {
  batchId?: string;
  className?: string;
}

const IoTDashboard: React.FC<IoTDashboardProps> = ({ batchId, className }) => {
  const [journeys, setJourneys] = useState<SupplyChainJourney[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<SupplyChainJourney | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Update journeys data
    const updateData = () => {
      const allJourneys = iotSimulationService.getAllJourneys();
      setJourneys(allJourneys);
      
      if (batchId) {
        const journey = iotSimulationService.getJourney(batchId);
        if (journey) setSelectedJourney(journey);
      } else if (allJourneys.length > 0 && !selectedJourney) {
        setSelectedJourney(allJourneys[0]);
      }
    };

    updateData();
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, [batchId, selectedJourney]);

  const startDemoMonitoring = async () => {
    setIsMonitoring(true);
    
    // Start demo IoT monitoring
    const demoJourney = await iotSimulationService.startIoTMonitoring(
      'DEMO-' + Date.now(),
      'COVID-19 Vaccines',
      'Alexandria Pharma Complex',
      'Cairo General Hospital'
    );
    
    setSelectedJourney(demoJourney);
  };

  const stopMonitoring = () => {
    if (selectedJourney) {
      iotSimulationService.stopIoTMonitoring(selectedJourney.batchId);
      setIsMonitoring(false);
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      case 'humidity': return <Droplets className="h-4 w-4" />;
      case 'gps': return <MapPin className="h-4 w-4" />;
      case 'vibration': return <Zap className="h-4 w-4" />;
      case 'light': return <Eye className="h-4 w-4" />;
      default: return <Signal className="h-4 w-4" />;
    }
  };

  const getSensorColor = (type: string) => {
    switch (type) {
      case 'temperature': return 'text-red-400';
      case 'humidity': return 'text-blue-400';
      case 'gps': return 'text-green-400';
      case 'vibration': return 'text-yellow-400';
      case 'light': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getStageIcon = (stageId: string, completed: boolean) => {
    const iconClass = `h-6 w-6 ${completed ? 'text-green-400' : 'text-blue-400'}`;
    
    switch (true) {
      case stageId.includes('transport'):
        return <Truck className={iconClass} />;
      case stageId.includes('manufacturing'):
      case stageId.includes('packaging'):
      case stageId.includes('distribution'):
      case stageId.includes('destination'):
        return <Building className={iconClass} />;
      default:
        return <MapPin className={iconClass} />;
    }
  };

  if (!selectedJourney && journeys.length === 0) {
    return (
      <Card className={`p-8 bg-gray-800/50 border-gray-700 text-center ${className}`}>
        <div className="space-y-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
            <Thermometer className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">IoT Monitoring Dashboard</h3>
            <p className="text-gray-400 mb-6">
              Start IoT monitoring to see real-time sensor data from the medical supply chain
            </p>
            <Button onClick={startDemoMonitoring} className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-2" />
              Start Demo IoT Monitoring
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Control Panel */}
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">IoT Monitoring Active</span>
            </div>
            
            {selectedJourney && (
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Batch: {selectedJourney.batchId}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!isMonitoring ? (
              <Button size="sm" onClick={startDemoMonitoring} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={stopMonitoring}>
                <Pause className="h-4 w-4 mr-1" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </Card>

      {selectedJourney && (
        <>
          {/* Journey Progress */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Supply Chain Journey Progress</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Overall Progress</span>
                <span className="text-white font-medium">
                  {Math.round((selectedJourney.currentStage / selectedJourney.stages.length) * 100)}%
                </span>
              </div>
              
              <Progress 
                value={(selectedJourney.currentStage / selectedJourney.stages.length) * 100} 
                className="h-2"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {selectedJourney.stages.map((stage, index) => (
                  <div 
                    key={stage.id}
                    className={`p-3 rounded-lg border ${
                      stage.completed 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : index === selectedJourney.currentStage
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-gray-700/50 border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getStageIcon(stage.id, stage.completed)}
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{stage.name}</h4>
                        <p className="text-xs text-gray-400">{stage.location}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {stage.completed ? (
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          ) : index === selectedJourney.currentStage ? (
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                          ) : (
                            <div className="w-3 h-3 bg-gray-600 rounded-full" />
                          )}
                          <span className="text-xs text-gray-400">
                            {stage.completed ? 'Completed' : index === selectedJourney.currentStage ? 'In Progress' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Live Sensor Data */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Live Sensor Readings</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Updating every 3s</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedJourney.sensors.filter(sensor => sensor.isActive).map(sensor => (
                <Card key={sensor.id} className="p-4 bg-gray-700/50 border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={getSensorColor(sensor.type)}>
                        {getSensorIcon(sensor.type)}
                      </div>
                      <span className="text-sm font-medium text-white capitalize">
                        {sensor.type}
                      </span>
                    </div>
                    
                    <Badge 
                      className={`text-xs ${
                        sensor.batteryLevel > 50 
                          ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}
                    >
                      <Battery className="h-3 w-3 mr-1" />
                      {sensor.batteryLevel}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-white">
                      {sensor.lastReading.toFixed(1)}
                      <span className="text-sm text-gray-400 ml-1">
                        {sensor.type === 'temperature' ? '°C' : 
                         sensor.type === 'humidity' ? '%' :
                         sensor.type === 'vibration' ? 'g' :
                         sensor.type === 'light' ? 'lux' : ''}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      📍 {sensor.location}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Signal className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-400">95%</span>
                      </div>
                      <div className="text-gray-500">
                        {sensor.id.split('-')[0]}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Recent Alerts */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Sensor Alerts</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-white">Temperature Warning</h4>
                  <p className="text-xs text-gray-300">Temperature reached 9.2°C during highway transport</p>
                  <p className="text-xs text-gray-500 mt-1">2 minutes ago • TEMP-DEMO-001</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-white">Temperature Normalized</h4>
                  <p className="text-xs text-gray-300">Temperature back to safe range: 4.1°C</p>
                  <p className="text-xs text-gray-500 mt-1">30 seconds ago • TEMP-DEMO-001</p>
                </div>
              </div>
              
              <div className="text-center py-4 text-gray-400 text-sm">
                All sensors operating within normal parameters ✅
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default IoTDashboard;