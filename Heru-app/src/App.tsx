import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import WelcomePage from "./components/WelcomePage";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import ShipmentDetails from "./pages/ShipmentDetails";
import Verification from "./pages/Verification";
import VerificationPage from "./pages/VerificationPage";
import DivineSeal from "./pages/DivineSeal";
import DataDashboard from "./pages/DataDashboard";
import IoTMonitoringPage from "./pages/IoTMonitoringPage";
import NotFound from "./pages/NotFound";
import { ArchitectureDemo } from "./components/ArchitectureDemo";
import HeruPharmaceuticalDashboard from "./components/SacredVaultDashboard";
import TransactionScanner from "./components/TransactionScanner";
import QRScanner from "./components/QRScanner";
import StoragePerformanceDashboard from "./components/StoragePerformanceDashboard";
import SmartContractDashboard from "./components/SmartContractDashboard";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showNavigation = location.pathname !== '/';

  return (
    <>
      {showNavigation && <Navigation />}
      <div className={showNavigation ? 'pt-28 bg-black' : ''}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/data-dashboard" element={<DataDashboard />} />
          <Route path="/iot-monitoring" element={<IoTMonitoringPage />} />
          <Route path="/scanner" element={<HeruPharmaceuticalDashboard />} />
          <Route path="/transaction-scanner" element={<TransactionScanner />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/storage-comparison" element={<StoragePerformanceDashboard />} />
          <Route path="/contract" element={<SmartContractDashboard />} />
          <Route path="/verify/:identifier" element={<VerificationPage />} />
          <Route path="/shipment/:id" element={<ShipmentDetails />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/create-seal" element={<DivineSeal />} />
          <Route path="/architecture-demo" element={<ArchitectureDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
