import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  RefreshCw,
  Server,
  Database,
  Cloud,
  Shield
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  latency?: number;
  error?: string;
  icon: React.ReactNode;
}

const SystemStatusChecker: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Heru Frontend',
      url: 'http://localhost:8081',
      status: 'online', // Always online since we're running from it
      icon: <Server className="h-4 w-4" />
    },
    {
      name: 'Guardian API',
      url: 'http://localhost:3000',
      status: 'checking',
      icon: <Shield className="h-4 w-4" />
    },
    {
      name: 'IPFS Node',
      url: 'http://localhost:5001',
      status: 'checking',
      icon: <Database className="h-4 w-4" />
    },
    {
      name: 'Hedera Testnet',
      url: 'https://testnet.mirrornode.hedera.com',
      status: 'checking',
      icon: <Cloud className="h-4 w-4" />
    }
  ]);

  const [isChecking, setIsChecking] = useState(false);

  const checkServiceHealth = async (service: ServiceStatus): Promise<ServiceStatus> => {
    const startTime = Date.now();
    
    try {
      let response;
      
      if (service.name === 'Guardian API') {
        // Guardian API expects authentication, so 401 is actually "online"
        response = await fetch(`${service.url}/api/v1/accounts`, {
          method: 'GET'
        });
        
        // 401 means service is running but needs auth - that's good!
        if (response.status === 401 || response.status === 200) {
          return {
            ...service,
            status: 'online',
            latency: Date.now() - startTime
          };
        }
      } else if (service.name === 'IPFS Node') {
        response = await fetch(`${service.url}/api/v0/version`, {
          method: 'POST'
        });
      } else if (service.name === 'Hedera Testnet') {
        response = await fetch(`${service.url}/api/v1/accounts/0.0.2`, {
          method: 'GET'
        });
      } else {
        response = await fetch(service.url, { 
          method: 'GET'
        });
      }

      if (response.ok) {
        return {
          ...service,
          status: 'online',
          latency: Date.now() - startTime
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      return {
        ...service,
        status: 'offline',
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - startTime
      };
    }
  };

  const checkAllServices = async () => {
    setIsChecking(true);
    
    // Set all services to checking status
    setServices(prev => prev.map(service => ({
      ...service,
      status: service.name === 'Heru Frontend' ? 'online' : 'checking'
    })));

    // Check each service
    for (const service of services) {
      if (service.name === 'Heru Frontend') continue; // Skip frontend check
      
      const updatedService = await checkServiceHealth(service);
      
      setServices(prev => prev.map(s => 
        s.name === service.name ? updatedService : s
      ));
    }
    
    setIsChecking(false);
  };

  useEffect(() => {
    checkAllServices();
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <X className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>;
      case 'offline':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Offline</Badge>;
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Checking...</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Unknown</Badge>;
    }
  };

  const onlineServices = services.filter(s => s.status === 'online').length;
  const totalServices = services.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
            <p className="text-sm text-gray-600">
              {onlineServices}/{totalServices} services online
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkAllServices}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {service.icon}
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-600">{service.url}</p>
                  {service.error && (
                    <p className="text-xs text-red-600 mt-1">{service.error}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {service.latency && (
                  <span className="text-xs text-gray-500">{service.latency}ms</span>
                )}
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  {getStatusBadge(service.status)}
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Service Integration Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>Frontend ↔ Guardian:</span>
                <span className={services.find(s => s.name === 'Guardian API')?.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                  {services.find(s => s.name === 'Guardian API')?.status === 'online' ? '✓ Connected' : '✗ Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Frontend ↔ IPFS:</span>
                <span className={services.find(s => s.name === 'IPFS Node')?.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                  {services.find(s => s.name === 'IPFS Node')?.status === 'online' ? '✓ Connected' : '✗ Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Guardian ↔ Hedera:</span>
                <span className={services.find(s => s.name === 'Hedera Testnet')?.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                  {services.find(s => s.name === 'Hedera Testnet')?.status === 'online' ? '✓ Connected' : '✗ Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>End-to-End Flow:</span>
                <span className={onlineServices === totalServices ? 'text-green-600' : 'text-yellow-600'}>
                  {onlineServices === totalServices ? '✓ Fully Operational' : '⚠ Partial'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusChecker;