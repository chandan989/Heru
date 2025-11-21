import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, LayoutDashboard, Shield, Search, Zap, Activity, Thermometer, BarChart3 } from "lucide-react";
import heruLogo from "@/assets/heru-logo.svg";
import SimpleWalletConnector from "./SimpleWalletConnector";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Pharaoh\'s View', icon: LayoutDashboard },
    { path: '/verify', label: 'Eye of Horus', icon: Eye },
    { path: '/create-seal', label: 'Sacred Vault', icon: Shield },
    { path: '/storage-comparison', label: 'Real-Time Metrics', icon: BarChart3 },
  ];

  // On the WelcomePage, we don't show the navigation bar.
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 animate-fade-in-down pointer-events-none">
        <nav className="p-2   border border-primary/30 rounded-full shadow-lg shadow-primary/20 flex items-center gap-1 pointer-events-auto">
            {/* Logo Button */}
            <Button
                variant="ghost"
                onClick={() => navigate('/')}
            >
                <img src={heruLogo} alt="Heru Home" className="h-auto w-7" />
            </Button>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-primary/30 mx-1"></div>

            {/* Navigation Links */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "pharaoh" : "oracle"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="gap-2 rounded-full"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Button>
              );
            })}

            {/* Search/Verify button as a separate icon */}
            <div className="w-[1px] h-6 bg-primary/30 mx-1"></div>
            <Button
                variant="divine"
                size="icon"
                onClick={() => navigate('/verify')}
                className="rounded-full w-10 h-10"
            >
                <Search className="h-5 w-5" />
            </Button>

            {/* Simple Real Wallet Connection */}
            <div className="w-[1px] h-6 bg-primary/30 mx-1"></div>
            <SimpleWalletConnector />
        </nav>
    </header>
  );
};

export default Navigation;
