/**
 * IoT Simulation Service - Realistic Medical Cold Chain Monitoring
 * Simulates real IoT sensors throughout the medicine supply chain journey
 */

export interface IoTSensor {
  id: string;
  type: 'temperature' | 'humidity' | 'gps' | 'vibration' | 'light' | 'door' | 'battery';
  batchId: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  isActive: boolean;
  batteryLevel: number;
  lastReading: number;
  alertThresholds: {
    min?: number;
    max?: number;
    critical?: number;
  };
}

export interface IoTReading {
  sensorId: string;
  batchId: string;
  timestamp: string;
  value: number;
  unit: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  status: 'normal' | 'warning' | 'critical';
  deviceBattery: number;
  signalStrength: number;
}

export interface SupplyChainJourney {
  batchId: string;
  currentStage: number;
  stages: SupplyChainStage[];
  startTime: string;
  estimatedCompletion: string;
  sensors: IoTSensor[];
}

export interface SupplyChainStage {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  duration: number; // minutes
  tempRange: { min: number; max: number };
  risks: string[];
  completed: boolean;
  startTime?: string;
  endTime?: string;
}

class IoTSimulationService {
  private activeSensors: Map<string, IoTSensor> = new Map();
  private journeys: Map<string, SupplyChainJourney> = new Map();
  private simulationIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start IoT monitoring for a medicine batch
   */
  async startIoTMonitoring(batchId: string, medicine: string, origin: string, destination: string): Promise<SupplyChainJourney> {
    console.log(`📡 Starting IoT monitoring for batch ${batchId}: ${medicine}`);

    // Create realistic supply chain journey based on medicine type and locations
    const journey = this.createSupplyChainJourney(batchId, medicine, origin, destination);
    
    // Deploy virtual IoT sensors
    const sensors = this.deployIoTSensors(batchId, journey);
    journey.sensors = sensors;
    
    this.journeys.set(batchId, journey);
    
    // Start simulation
    this.startJourneySimulation(batchId);
    
    console.log(`✅ IoT monitoring active for ${batchId}:`, {
      totalStages: journey.stages.length,
      sensorsDeployed: sensors.length,
      estimatedDuration: this.calculateJourneyDuration(journey.stages)
    });

    return journey;
  }

  /**
   * Create realistic supply chain journey
   */
  private createSupplyChainJourney(batchId: string, medicine: string, origin: string, destination: string): SupplyChainJourney {
    // Egypt-focused supply chain stages
    const stages: SupplyChainStage[] = [
      {
        id: 'manufacturing',
        name: 'Manufacturing Facility',
        location: origin || 'Alexandria Pharma Complex',
        coordinates: { lat: 31.2001, lng: 29.9187 },
        duration: 60, // 1 hour quality control
        tempRange: { min: 2, max: 8 },
        risks: ['power_outage', 'equipment_malfunction'],
        completed: false
      },
      {
        id: 'packaging',
        name: 'Cold Storage Packaging',
        location: 'Alexandria Cold Chain Hub',
        coordinates: { lat: 31.1975, lng: 29.9097 },
        duration: 30,
        tempRange: { min: 2, max: 8 },
        risks: ['loading_delay', 'temperature_spike'],
        completed: false
      },
      {
        id: 'transport_1',
        name: 'Highway Transport to Cairo',
        location: 'Alexandria-Cairo Highway',
        coordinates: { lat: 30.8025, lng: 30.0444 },
        duration: 180, // 3 hours drive
        tempRange: { min: 2, max: 8 },
        risks: ['traffic_delay', 'vehicle_breakdown', 'temperature_fluctuation'],
        completed: false
      },
      {
        id: 'distribution_hub',
        name: 'Cairo Distribution Center',
        location: 'Cairo Medical Distribution Hub',
        coordinates: { lat: 30.0444, lng: 31.2357 },
        duration: 45,
        tempRange: { min: 2, max: 8 },
        risks: ['sorting_delay', 'handling_error'],
        completed: false
      },
      {
        id: 'local_transport',
        name: 'Local Delivery',
        location: 'Cairo Local Routes',
        coordinates: { lat: 30.0500, lng: 31.2400 },
        duration: 60,
        tempRange: { min: 2, max: 8 },
        risks: ['traffic_congestion', 'delivery_delay'],
        completed: false
      },
      {
        id: 'destination',
        name: 'Final Destination',
        location: destination || 'Cairo General Hospital',
        coordinates: { lat: 30.0626, lng: 31.2497 },
        duration: 15, // Reception and storage
        tempRange: { min: 2, max: 8 },
        risks: ['storage_capacity', 'power_issues'],
        completed: false
      }
    ];

    const startTime = new Date().toISOString();
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    const estimatedCompletion = new Date(Date.now() + totalDuration * 60000).toISOString();

    return {
      batchId,
      currentStage: 0,
      stages,
      startTime,
      estimatedCompletion,
      sensors: []
    };
  }

  /**
   * Deploy virtual IoT sensors for the journey
   */
  private deployIoTSensors(batchId: string, journey: SupplyChainJourney): IoTSensor[] {
    const sensors: IoTSensor[] = [];

    // Primary temperature sensor (always active)
    sensors.push({
      id: `TEMP-${batchId}-001`,
      type: 'temperature',
      batchId,
      location: journey.stages[0].location,
      coordinates: journey.stages[0].coordinates,
      isActive: true,
      batteryLevel: 100,
      lastReading: 0,
      alertThresholds: { min: -2, max: 8, critical: 12 }
    });

    // Humidity sensor
    sensors.push({
      id: `HUMID-${batchId}-001`,
      type: 'humidity',
      batchId,
      location: journey.stages[0].location,
      coordinates: journey.stages[0].coordinates,
      isActive: true,
      batteryLevel: 95,
      lastReading: 0,
      alertThresholds: { max: 80, critical: 90 }
    });

    // GPS tracker
    sensors.push({
      id: `GPS-${batchId}-001`,
      type: 'gps',
      batchId,
      location: journey.stages[0].location,
      coordinates: journey.stages[0].coordinates,
      isActive: true,
      batteryLevel: 85,
      lastReading: 0,
      alertThresholds: {}
    });

    // Vibration sensor (for transport damage detection)
    sensors.push({
      id: `VIB-${batchId}-001`,
      type: 'vibration',
      batchId,
      location: journey.stages[0].location,
      coordinates: journey.stages[0].coordinates,
      isActive: true,
      batteryLevel: 90,
      lastReading: 0,
      alertThresholds: { max: 5, critical: 10 }
    });

    // Light sensor (package integrity)
    sensors.push({
      id: `LIGHT-${batchId}-001`,
      type: 'light',
      batchId,
      location: journey.stages[0].location,
      coordinates: journey.stages[0].coordinates,
      isActive: true,
      batteryLevel: 88,
      lastReading: 0,
      alertThresholds: { max: 100, critical: 500 }
    });

    sensors.forEach(sensor => {
      this.activeSensors.set(sensor.id, sensor);
    });

    return sensors;
  }

  /**
   * Start the journey simulation
   */
  private startJourneySimulation(batchId: string): void {
    const interval = setInterval(async () => {
      const journey = this.journeys.get(batchId);
      if (!journey) {
        clearInterval(interval);
        return;
      }

      // Generate sensor readings
      const readings = this.generateSensorReadings(journey);
      
      // Process each reading
      for (const reading of readings) {
        // Log to console for demo visibility
        this.logIoTReading(reading);
        
        // Here you would send to HCS in real implementation
        // await this.sendToHCS(reading);
      }

      // Update journey progress
      this.updateJourneyProgress(journey);

      // Check if journey is complete
      if (this.isJourneyComplete(journey)) {
        console.log(`🏁 IoT monitoring completed for batch ${batchId}`);
        this.stopIoTMonitoring(batchId);
      }
    }, 3000); // Update every 3 seconds for demo

    this.simulationIntervals.set(batchId, interval);
  }

  /**
   * Generate realistic sensor readings
   */
  private generateSensorReadings(journey: SupplyChainJourney): IoTReading[] {
    const readings: IoTReading[] = [];
    const currentStage = journey.stages[journey.currentStage];
    
    if (!currentStage) return readings;

    journey.sensors.forEach(sensor => {
      if (!sensor.isActive) return;

      let value = 0;
      let unit = '';
      let status: 'normal' | 'warning' | 'critical' = 'normal';

      switch (sensor.type) {
        case 'temperature':
          // Generate temperature with realistic variations
          const baseTemp = (currentStage.tempRange.min + currentStage.tempRange.max) / 2;
          const variation = this.getTemperatureVariation(currentStage.id);
          value = baseTemp + variation + (Math.random() - 0.5) * 2;
          unit = '°C';
          
          if (value < sensor.alertThresholds.min! || value > sensor.alertThresholds.max!) {
            status = 'warning';
          }
          if (value > sensor.alertThresholds.critical!) {
            status = 'critical';
          }
          break;

        case 'humidity':
          value = 60 + Math.random() * 20; // 60-80% normal range
          unit = '%';
          if (value > 80) status = 'warning';
          if (value > 90) status = 'critical';
          break;

        case 'vibration':
          value = this.getVibrationLevel(currentStage.id);
          unit = 'g';
          if (value > 5) status = 'warning';
          if (value > 10) status = 'critical';
          break;

        case 'light':
          value = this.getLightLevel(currentStage.id);
          unit = 'lux';
          if (value > 100) status = 'warning';
          break;

        case 'gps':
          // GPS coordinates with some drift
          const coords = this.getGPSWithDrift(currentStage.coordinates);
          value = coords.lat; // Just use lat for demo
          unit = 'coordinates';
          break;
      }

      // Simulate battery drain
      sensor.batteryLevel = Math.max(0, sensor.batteryLevel - 0.1);
      
      const reading: IoTReading = {
        sensorId: sensor.id,
        batchId: journey.batchId,
        timestamp: new Date().toISOString(),
        value: Math.round(value * 100) / 100,
        unit,
        location: currentStage.location,
        coordinates: currentStage.coordinates,
        status,
        deviceBattery: Math.round(sensor.batteryLevel),
        signalStrength: 85 + Math.random() * 15
      };

      readings.push(reading);
    });

    return readings;
  }

  /**
   * Get temperature variation based on stage
   */
  private getTemperatureVariation(stageId: string): number {
    switch (stageId) {
      case 'manufacturing': return 0; // Controlled environment
      case 'packaging': return Math.random() * 0.5;
      case 'transport_1': return Math.random() * 2 - 1; // -1 to +1°C variation
      case 'distribution_hub': return Math.random() * 0.8;
      case 'local_transport': return Math.random() * 1.5 - 0.75;
      case 'destination': return Math.random() * 0.3;
      default: return 0;
    }
  }

  /**
   * Get vibration level based on stage
   */
  private getVibrationLevel(stageId: string): number {
    switch (stageId) {
      case 'transport_1': return 2 + Math.random() * 3; // Highway transport
      case 'local_transport': return 1.5 + Math.random() * 2; // City driving
      case 'packaging': return 0.5 + Math.random() * 1; // Handling
      default: return Math.random() * 0.5; // Minimal vibration
    }
  }

  /**
   * Get light level based on stage
   */
  private getLightLevel(stageId: string): number {
    const isTransport = stageId.includes('transport');
    const baseLight = isTransport ? 10 : 50; // Lower in transport vehicles
    return baseLight + Math.random() * 30;
  }

  /**
   * Get GPS coordinates with realistic drift
   */
  private getGPSWithDrift(baseCoords: { lat: number; lng: number }): { lat: number; lng: number } {
    return {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.01, // ~1km drift
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.01
    };
  }

  /**
   * Update journey progress
   */
  private updateJourneyProgress(journey: SupplyChainJourney): void {
    const currentStage = journey.stages[journey.currentStage];
    if (!currentStage) return;

    // Simulate stage progression (simplified for demo)
    if (!currentStage.startTime) {
      currentStage.startTime = new Date().toISOString();
    }

    const stageStartTime = new Date(currentStage.startTime).getTime();
    const stageElapsed = Date.now() - stageStartTime;
    const stageDuration = currentStage.duration * 60000; // Convert to milliseconds

    if (stageElapsed > stageDuration) {
      currentStage.completed = true;
      currentStage.endTime = new Date().toISOString();
      journey.currentStage++;
      
      console.log(`📍 Stage completed: ${currentStage.name}`);
      
      // Update sensor locations for next stage
      if (journey.currentStage < journey.stages.length) {
        const nextStage = journey.stages[journey.currentStage];
        journey.sensors.forEach(sensor => {
          sensor.location = nextStage.location;
          sensor.coordinates = nextStage.coordinates;
        });
      }
    }
  }

  /**
   * Check if journey is complete
   */
  private isJourneyComplete(journey: SupplyChainJourney): boolean {
    return journey.currentStage >= journey.stages.length;
  }

  /**
   * Log IoT reading to console (and potentially HCS)
   */
  private logIoTReading(reading: IoTReading): void {
    const statusEmoji = reading.status === 'critical' ? '🚨' : reading.status === 'warning' ? '⚠️' : '✅';
    
    console.log(`📡 IoT ${reading.sensorId}: ${reading.value}${reading.unit} at ${reading.location} ${statusEmoji}`);
    
    if (reading.status !== 'normal') {
      console.log(`⚡ ALERT: ${reading.sensorId} reading ${reading.value}${reading.unit} is ${reading.status}!`);
    }
  }

  /**
   * Get active journey
   */
  getJourney(batchId: string): SupplyChainJourney | undefined {
    return this.journeys.get(batchId);
  }

  /**
   * Get all active journeys
   */
  getAllJourneys(): SupplyChainJourney[] {
    return Array.from(this.journeys.values());
  }

  /**
   * Stop IoT monitoring
   */
  stopIoTMonitoring(batchId: string): void {
    const interval = this.simulationIntervals.get(batchId);
    if (interval) {
      clearInterval(interval);
      this.simulationIntervals.delete(batchId);
    }
    
    // Keep journey data but mark sensors inactive
    const journey = this.journeys.get(batchId);
    if (journey) {
      journey.sensors.forEach(sensor => {
        sensor.isActive = false;
        this.activeSensors.delete(sensor.id);
      });
    }
    
    console.log(`📡 IoT monitoring stopped for batch ${batchId}`);
  }

  /**
   * Calculate total journey duration
   */
  private calculateJourneyDuration(stages: SupplyChainStage[]): string {
    const totalMinutes = stages.reduce((sum, stage) => sum + stage.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  /**
   * Get journey statistics
   */
  getJourneyStats(batchId: string): any {
    const journey = this.journeys.get(batchId);
    if (!journey) return null;

    const completedStages = journey.stages.filter(stage => stage.completed).length;
    const totalStages = journey.stages.length;
    const progress = (completedStages / totalStages) * 100;

    return {
      batchId,
      progress: Math.round(progress),
      currentStage: journey.stages[journey.currentStage]?.name || 'Completed',
      activeSensors: journey.sensors.filter(s => s.isActive).length,
      completedStages,
      totalStages,
      startTime: journey.startTime,
      estimatedCompletion: journey.estimatedCompletion
    };
  }
}

export const iotSimulationService = new IoTSimulationService();
export default IoTSimulationService;