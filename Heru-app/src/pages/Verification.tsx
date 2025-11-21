import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle,
  Eye,
  AlertTriangle,
  Scan,
  Shield,
  ChevronUp,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import heruLogo from "@/assets/heru-logo.svg";

// --- Copied Components from WelcomePage.tsx ---

// Custom Cursor Component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };

    checkTouchDevice();

    const mouseMoveHandler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const mouseEnterHandler = () => setIsHovering(true);
    const mouseLeaveHandler = () => setIsHovering(false);

    if (!isTouchDevice) {
      document.addEventListener("mousemove", mouseMoveHandler);

      const interactiveElements = document.querySelectorAll(
        "a, button, [role='button'], .cursor-pointer"
      );
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", mouseEnterHandler);
        el.addEventListener("mouseleave", mouseLeaveHandler);
      });

      return () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        interactiveElements.forEach((el) => {
          el.removeEventListener("mouseenter", mouseEnterHandler);
          el.removeEventListener("mouseleave", mouseLeaveHandler);
        });
      };
    }
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      className={`fixed pointer-events-none z-[10000] rounded-full transition-all duration-200 ${
        isHovering ? "w-10 h-10 bg-primary/20" : "w-5 h-5 bg-primary/50"
      }`}
      style={{
        left: position.x - (isHovering ? 20 : 10),
        top: position.y - (isHovering ? 20 : 10),
      }}
    />
  );
};

// Scroll Progress Bar Component
const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
      <div
        className="h-full bg-primary shadow-violet transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

// Back to Top Button Component
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      className={`fixed bottom-6 right-6 z-[9998] bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-violet hover:glow-divine transition-all duration-300 ${
        isVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={scrollToTop}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <ChevronUp className="h-6 w-6" />
    </motion.button>
  );
};

// Animation wrapper component
const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
};

// --- End of Copied Components ---

const Verification = () => {
  const navigate = useNavigate();
  const [scanComplete, setScanComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Particles configuration
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    particles: {
      number: {
        value: 60,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#9900ff",
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.4,
        random: true,
      },
      size: {
        value: 2,
        random: true,
      },
      move: {
        enable: true,
        speed: 0.4,
        direction: "none" as const,
        random: true,
        straight: false,
        outModes: {
          default: "out" as const,
        },
      },
    },
    interactivity: {
      detectsOn: "canvas" as const,
      events: {
        onHover: {
          enable: true,
          mode: "bubble",
        },
        resize: true,
      },
      modes: {
        bubble: {
          distance: 150,
          size: 4,
          duration: 2,
          opacity: 0.8,
        },
      },
    },
    detectRetina: true,
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 3000);
  };

  const mockVerificationData = {
    id: "HRU-2024-001",
    medicine: "COVID-19 Vaccines (Pfizer)",
    status: "verified",
    batchNumber: "VX2024-A1B2C3",
    expiry: "2025-12-31",
    manufacturer: "Pharma Labs International",
    currentTemp: "4.2°C",
    tempHistory: "Maintained 2-8°C",
    lastUpdate: "2 minutes ago",
    authenticity: "100% Verified by Divine Oracle",
  };

  const renderScanner = () => (
    <main className="relative z-[2] container mx-auto p-4 sm:p-6">
      <AnimatedSection delay={0.1} className="text-center mb-12">

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          Eye of Horus
        </h1>
        <p className="text-lg text-muted-foreground">
          Scan a QR code to verify medicine authenticity through divine sight
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.3}>
        <Card className="p-8 bg-card/20 backdrop-blur-sm border-primary/30 mb-12 hover:glow-divine transition-all duration-300">
          {!isScanning ? (
            <div className="text-center">
              <div className="bg-primary/10 w-48 h-48 mx-auto rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center mb-6">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-primary mx-auto mb-4 animate-divine-float" />
                  <p className="text-primary font-medium">Position QR Code</p>
                </div>
              </div>
              <Button variant="divine" size="xl" onClick={handleScan}>
                <Scan className="h-5 w-5 mr-2" />
                Activate Divine Scanner
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Align the medicine's QR code within the sacred viewing area
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-primary/20 w-48 h-48 mx-auto rounded-2xl border-2 border-primary flex items-center justify-center mb-6 animate-divine-glow">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-primary font-medium">Consulting Oracle...</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-divine mb-2">
                Divine Scanning in Progress
              </h3>
              <p className="text-muted-foreground">
                The Oracle examines the sacred seal for authenticity and divine
                protection...
              </p>
            </div>
          )}
        </Card>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <AnimatedSection delay={0.5}>
          <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Scan className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-divine mb-2">1. Scan QR Code</h3>
            <p className="text-sm text-muted-foreground">
              Use your device camera to scan the divine QR code on the medicine
              package
            </p>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.7}>
          <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-divine mb-2">2. Oracle Verification</h3>
            <p className="text-sm text-muted-foreground">
              The divine oracle instantly verifies authenticity and cold chain
              integrity
            </p>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.9}>
          <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-divine mb-2">3. Divine Blessing</h3>
            <p className="text-sm text-muted-foreground">
              Receive instant confirmation of medicine safety and potency
            </p>
          </Card>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={1.1}>
        <Card className="p-6 bg-warning/10 border-warning/20 hover:glow-warning transition-all duration-300">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-warning">
                Offline Verification Available
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                The Oracle can verify medicines even without internet connection
                using cached divine records.
              </p>
            </div>
          </div>
        </Card>
      </AnimatedSection>
    </main>
  );

  const renderVerificationResult = () => (
    <main className="relative z-[2] container mx-auto p-4 sm:p-6">
      <AnimatedSection delay={0.1} className="text-center mb-12">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 bg-success/20 rounded-full flex items-center justify-center animate-divine-glow">
          <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-success" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          Divine Verification Complete
        </h1>
        <p className="text-lg text-muted-foreground">
          The Oracle has spoken - this medicine is blessed and authentic
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.3}>
        <Card className="p-6 sm:p-8 mb-8 bg-card/20 backdrop-blur-sm border-success/30 hover:glow-success transition-all duration-300">
          <div className="text-center mb-8">
            <Badge className="bg-success/20 text-success border-success/30 text-lg px-6 py-2">
              ✓ VERIFIED AUTHENTIC
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-divine mb-4">
                Medicine Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Shipment ID</p>
                  <p className="font-semibold text-primary">
                    {mockVerificationData.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medicine</p>
                  <p className="font-semibold text-foreground">
                    {mockVerificationData.medicine}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batch Number</p>
                  <p className="font-semibold text-foreground">
                    {mockVerificationData.batchNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-semibold text-foreground">
                    {mockVerificationData.expiry}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-divine mb-4">
                Sacred Chain Status
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Temperature
                  </p>
                  <p className="font-semibold text-success">
                    {mockVerificationData.currentTemp}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Temperature History
                  </p>
                  <p className="font-semibold text-success">
                    {mockVerificationData.tempHistory}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Update</p>
                  <p className="font-semibold text-foreground">
                    {mockVerificationData.lastUpdate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Authenticity</p>
                  <p className="font-semibold text-success">
                    {mockVerificationData.authenticity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6 text-success" />
              <h4 className="font-semibold text-success">
                Divine Blessing Confirmed
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              This medicine has maintained its sacred cold chain and authenticity
              throughout its journey. It is safe to administer and retains full
              potency as blessed by Heru's divine protection.
            </p>
          </div>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.5} className="flex gap-4 justify-center">
        <Button
          variant="divine"
          size="lg"
          onClick={() => navigate("/shipment/1")}
        >
          View Complete Sacred Journey
        </Button>
        <Button
          variant="oracle"
          size="lg"
          onClick={() => setScanComplete(false)}
        >
          Scan Another Divine Seal
        </Button>
      </AnimatedSection>
    </main>
  );

  return (
    <div className="min-h-screen bg-black text-foreground overflow-x-hidden">
      <CustomCursor />
      <ScrollProgress />
      <BackToTop />

      {/* Particles Background */}
      <div className="fixed inset-0 z-[1]">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
          className="w-full h-full"
        />
      </div>

      {scanComplete ? renderVerificationResult() : renderScanner()}

      {/* Footer */}
      <footer className="relative z-[2] border-t border-primary/30 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={heruLogo} alt="Eye of Horus Logo" className="w-10 h-10" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-foreground">
              Heru
            </h1>
          </div>
          <p className="mb-4 text-sm sm:text-base">
            Crafted with divine love for a healed world. 𓅃
          </p>
          <p className="text-xs sm:text-sm">
            &copy; 2025 Heru. The eternal guardian watches over healing's sacred
            journey. May the falcon's eye guide you. 🦅
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Verification;
