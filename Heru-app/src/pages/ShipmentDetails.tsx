import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Thermometer, MapPin, Clock, Shield, User, Package, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShipmentDetails = () => {
  const navigate = useNavigate();

  const temperatureData = [
    { time: "00:00", temp: 4.2 },
    { time: "04:00", temp: 4.1 },
    { time: "08:00", temp: 4.3 },
    { time: "12:00", temp: 4.0 },
    { time: "16:00", temp: 4.2 },
    { time: "20:00", temp: 4.1 },
  ];

  const timeline = [
    {
      time: "2024-01-15 08:00",
      event: "Divine Seal Created",
      location: "Pharma Labs, Alexandria",
      user: "Dr. Sarah Ahmed",
      icon: Shield,
      status: "completed"
    },
    {
      time: "2024-01-15 09:30", 
      event: "Cold Chain Activated",
      location: "Alexandria Distribution Center",
      user: "Ahmed Hassan",
      icon: Thermometer,
      status: "completed"
    },
    {
      time: "2024-01-15 11:00",
      event: "In Sacred Transit",
      location: "Highway to Cairo",
      user: "Transport Unit Alpha",
      icon: Package,
      status: "current"
    },
    {
      time: "Expected: 15:00",
      event: "Delivery to Sacred Destination",
      location: "Cairo Medical Center",
      user: "Pending",
      icon: MapPin,
      status: "pending"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-sacred">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="oracle" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Pharaoh's View
          </Button>
          
          <div>
            <h1 className="text-4xl font-bold text-divine">The Sacred Journey</h1>
            <p className="text-muted-foreground">HRU-2024-001 - COVID-19 Vaccines</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipment Overview */}
            <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-divine mb-2">Shipment Overview</h2>
                  <Badge className="bg-primary/20 text-primary border-primary/30">In Sacred Transit</Badge>
                </div>
                
                <Button variant="sacred">
                  <QrCode className="h-4 w-4 mr-2" />
                  View Divine Seal
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Medicine Type</p>
                  <p className="font-semibold text-foreground">COVID-19 Vaccines (Pfizer)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold text-foreground">1,000 doses</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Origin</p>
                  <p className="font-semibold text-foreground">Pharma Labs, Alexandria</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-semibold text-foreground">Cairo Medical Center</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Required Temperature</p>
                  <p className="font-semibold text-primary">2-8°C</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Progress</p>
                  <p className="font-semibold text-foreground">65% Complete</p>
                </div>
              </div>
            </Card>

            {/* Temperature Monitoring */}
            <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <Thermometer className="h-6 w-6 text-primary animate-divine-float" />
                <h2 className="text-2xl font-semibold text-divine">Divine Temperature Oracle</h2>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Current Temperature</span>
                  <span className="text-primary font-semibold">4.1°C - Sacred Range</span>
                </div>
                <div className="bg-secondary/20 rounded-full h-2">
                  <div className="bg-gradient-divine h-2 rounded-full w-3/4" />
                </div>
              </div>

              {/* Temperature Chart Simulation */}
              <div className="grid grid-cols-6 gap-2">
                {temperatureData.map((data, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-primary/20 h-16 rounded flex items-end justify-center mb-2">
                      <div 
                        className="bg-gradient-divine w-4 rounded-t"
                        style={{ height: `${(data.temp / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{data.time}</p>
                    <p className="text-xs text-primary font-medium">{data.temp}°C</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sacred Timeline */}
            <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-primary animate-divine-float" />
                <h2 className="text-2xl font-semibold text-divine">Sacred Timeline</h2>
              </div>
              
              <div className="space-y-6">
                {timeline.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        event.status === 'completed' ? 'bg-success/20' :
                        event.status === 'current' ? 'bg-primary/20 animate-divine-glow' :
                        'bg-muted/20'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          event.status === 'completed' ? 'text-success' :
                          event.status === 'current' ? 'text-primary' :
                          'text-muted-foreground'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{event.event}</h3>
                          {event.status === 'current' && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{event.user}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{event.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold text-divine mb-4">Divine Stats</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Elapsed Time</span>
                  <span className="font-medium text-foreground">3h 15m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance Covered</span>
                  <span className="font-medium text-foreground">195 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Temperature</span>
                  <span className="font-medium text-primary">4.2°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blockchain Confirmations</span>
                  <span className="font-medium text-success">12</span>
                </div>
              </div>
            </Card>

            {/* Divine Actions */}
            <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold text-divine mb-4">Divine Actions</h3>
              
              <div className="space-y-3">
                <Button variant="sacred" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Update Divine Seal
                </Button>
                <Button variant="oracle" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Contact Guardian
                </Button>
                <Button variant="pharaoh" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Track Real-time
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;