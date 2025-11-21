import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import heruLogo from "@/assets/heru-logo.svg";
import LiveDashboard from "@/components/LiveDashboard";
import IoTDashboard from "@/components/IoTDashboard";
import { batchRegistryService } from '@/services/batchRegistryService';
import { publishBatchAnchor } from '@/services/consensusAnchoringService';
import { verifyBatchIntegrity } from '@/services/verificationService';

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

      const interactiveElements = document.querySelectorAll("a, button, [role='button'], .cursor-pointer");
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

const Dashboard = () => {
  const navigate = useNavigate();

  // Particles configuration from WelcomePage
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

  const shipments = [
    {
      id: "HRU-2024-001",
      medicine: "COVID-19 Vaccines",
      status: "in-transit",
      destination: "Cairo Medical Center",
      temperature: "2-8°C",
      progress: 65,
    },
    {
      id: "HRU-2024-002",
      medicine: "Insulin Pens",
      status: "delivered",
      destination: "Alexandria Hospital",
      temperature: "2-8°C",
      progress: 100,
    },
    {
      id: "HRU-2024-003",
      medicine: "Blood Products",
      status: "warning",
      destination: "Luxor Emergency Center",
      temperature: "4-6°C",
      progress: 45,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            Delivered
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            Divine Warning
          </Badge>
        );
      default:
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            In Sacred Transit
          </Badge>
        );
    }
  };

  // --- New: Batch Registry Listing (Real/Simulated created NFTs) ---
  const [batches, setBatches] = useState<any[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [lastVerification, setLastVerification] = useState<Record<string, any>>({});
  const refreshBatches = () => {
    try { setBatches(batchRegistryService.list().sort((a,b)=> b.createdAt.localeCompare(a.createdAt))); } catch {}
  };
  useEffect(() => { refreshBatches(); const i = setInterval(refreshBatches, 5000); return ()=>clearInterval(i); }, []);

  const handleAnchor = async (id: string) => {
    setAnchoringId(id);
    try { await publishBatchAnchor(id); refreshBatches(); } finally { setAnchoringId(null); }
  };
  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try { const res = await verifyBatchIntegrity(id); setLastVerification(v => ({ ...v, [id]: res })); } finally { setVerifyingId(null); }
  };

  const renderBatchStatus = (b:any) => {
    const v = lastVerification[b.id];
    if (v?.status === 'valid') return <Badge className="bg-green-600/20 text-green-500 border-green-600/30">Valid</Badge>;
    if (v?.status === 'mismatch') return <Badge className="bg-red-600/20 text-red-500 border-red-600/30">Hash Mismatch</Badge>;
    if (v?.status === 'unanchored') return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Unanchored</Badge>;
    return <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">{b.status}</Badge>;
  };

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

      {/* Main Content */}
      <main className="relative z-[2] container mx-auto p-4 sm:p-6">
        {/* Dashboard Hero Section (mimicking WelcomePage) */}
        <section className="min-h-[50vh] flex flex-col items-center justify-center text-center story-chunk px-4 sm:px-6 py-16">

          <AnimatedSection delay={0.3}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
              Pharaoh's View
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.5}>
            <p className="text-lg sm:text-xl md:text-xl max-w-3xl mx-auto text-muted-foreground mb-8">
              Command your sacred supply chain from the divine throne
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.7}>
            <Button
              variant="divine"
              size="xl"
              onClick={() => navigate("/create-seal")}
              className="w-full transform sm:w-auto transition-transform duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Divine Seal
            </Button>
          </AnimatedSection>
        </section>

        {/* Stats Overview */}
        <AnimatedSection delay={0.8} className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Active Shipments
                  </p>
                  <p className="text-3xl font-bold text-divine">12</p>
                </div>
                <Package className="h-8 w-8 text-primary animate-divine-float" />
              </div>
            </Card>

            <Card className="p-6 bg-card/20 backdrop-blur-sm border-success/30 hover:border-success transition-all duration-300 hover:glow-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Delivered Today</p>
                  <p className="text-3xl font-bold text-success">8</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success animate-divine-float" />
              </div>
            </Card>

            <Card className="p-6 bg-card/20 backdrop-blur-sm border-warning/30 hover:border-warning transition-all duration-300 hover:glow-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Divine Warnings</p>
                  <p className="text-3xl font-bold text-warning">2</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning animate-divine-float" />
              </div>
            </Card>

            <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Avg Transit Time</p>
                  <p className="text-3xl font-bold text-primary">2.4h</p>
                </div>
                <Clock className="h-8 w-8 text-primary animate-divine-float" />
              </div>
            </Card>
          </div>
        </AnimatedSection>

        {/* Shipments List */}
        <AnimatedSection delay={0.9}>
          <Card className="bg-card/20 backdrop-blur-sm border-primary/30 transition-all duration-300 hover:glow-divine">
            <div className="p-6 border-b border-primary/20">
              <h2 className="text-2xl font-semibold text-divine">
                Sacred Shipments
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <Card
                    key={shipment.id}
                    className="p-4 bg-card/30 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:glow-divine"
                    onClick={() => navigate("/shipment/1")}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {shipment.id}
                          </h3>
                          {getStatusBadge(shipment.status)}
                        </div>

                        <p className="text-primary font-medium">
                          {shipment.medicine}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          → {shipment.destination}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Temperature
                        </p>
                        <p className="font-medium text-primary">
                          {shipment.temperature}
                        </p>
                      </div>

                      <div className="text-right sm:ml-8">
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="font-bold text-foreground">
                          {shipment.progress}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 bg-secondary/20 rounded-full h-2">
                      <div
                        className="bg-gradient-divine h-2 rounded-full transition-all duration-300"
                        style={{ width: `${shipment.progress}%` }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </AnimatedSection>

        {/* Batch Registry List */}
        <AnimatedSection delay={0.95}>
          <Card className="bg-card/20 backdrop-blur-sm border-primary/30 transition-all duration-300 hover:glow-divine">
            <div className="p-6 border-b border-primary/20 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-divine">Vault Batches (On-Chain / Simulated)</h2>
              <Button size="sm" variant="outline" className="border-primary/40 text-primary" onClick={() => refreshBatches()}>↻ Refresh</Button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {batches.length === 0 && (
                <div className="text-sm text-muted-foreground">No batches yet. Create one via "New Divine Seal".</div>
              )}
              {batches.map(b => {
                const v = lastVerification[b.id];
                return (
                  <Card key={b.id} className="p-4 bg-card/30 border-primary/10 hover:border-primary/30 transition-all">
                    <div className="flex flex-wrap gap-4 items-start justify-between">
                      <div className="min-w-[200px]">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">{b.batchNumber}</h3>
                          {renderBatchStatus(b)}
                          {b.guardian && (
                            b.guardian.status === 'issued' ? (
                              <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">Guardian VC</Badge>
                            ) : b.guardian.status === 'pending' ? (
                              <Badge className="bg-amber-600/20 text-amber-300 border-amber-600/30">Guardian Pending</Badge>
                            ) : b.guardian.status === 'failed' ? (
                              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Guardian Failed</Badge>
                            ) : b.guardian.status === 'disabled' ? (
                              <Badge className="bg-slate-600/20 text-slate-300 border-slate-600/30">Guardian Off</Badge>
                            ) : null
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Medicine: <span className="text-primary">{b.medicine}</span></p>
                        <p className="text-xs text-muted-foreground">Token: {b.tokenId || '—'}</p>
                        <p className="text-xs text-muted-foreground">Storage: {b.metadata?.fileRef?.type || '—'} {b.metadata?.fileRef?.ref ? (<>
                          <Button variant="link" size="sm" className="text-[10px] p-0 ml-1" onClick={() => {
                            if (b.metadata.fileRef.type === 'HFS') window.open(`https://testnet.mirrornode.hedera.com/api/v1/files/${b.metadata.fileRef.ref}`, '_blank');
                            else if (b.metadata.fileRef.type === 'IPFS') window.open(`https://gateway.pinata.cloud/ipfs/${b.metadata.fileRef.ref}`, '_blank');
                          }}>view</Button>
                        </>) : null}</p>
                        <p className="text-[10px] text-muted-foreground">Hash: {b.metadata?.sha256 ? b.metadata.sha256.slice(0,10)+'…' : '—'}</p>
                        {b.guardian?.vcId && (
                          <p className="text-[10px] text-muted-foreground">VC: {b.guardian.vcId.slice(0,14)}…</p>
                        )}
                        {b.guardian?.vcHash && (
                          <p className="text-[10px] text-muted-foreground">VC Hash: {b.guardian.vcHash.slice(0,10)}…</p>
                        )}
                        {v && (
                          <p className="text-[10px] mt-1 text-muted-foreground">Verify: {v.status} {v.hashMatches===false && '⚠️'} {v.anchorMessageLocated && '⛓️'}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-auto">
                        <Button size="sm" className="bg-primary hover:bg-primary/80" disabled={anchoringId===b.id || b.anchor} onClick={() => handleAnchor(b.id)}>
                          {b.anchor ? 'Anchored' : anchoringId===b.id ? 'Anchoring…' : 'Anchor Hash'}
                        </Button>
                        <Button size="sm" variant="outline" className="border-primary/40 text-primary" disabled={verifyingId===b.id} onClick={() => handleVerify(b.id)}>
                          {verifyingId===b.id ? 'Verifying…' : 'Verify'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </AnimatedSection>

        {/* Live Data Integration */}
        <AnimatedSection delay={1.0} className="mb-12">
          <h2 className="text-2xl font-semibold text-divine mb-6 text-center">
            🌟 Live Blockchain Activity
          </h2>
          <LiveDashboard />
        </AnimatedSection>

        {/* IoT Sensors Integration */}
        <AnimatedSection delay={1.1} className="mb-12">
          <h2 className="text-2xl font-semibold text-divine mb-6 text-center">
            📡 IoT Sensor Networks
          </h2>
          <IoTDashboard />
        </AnimatedSection>
      </main>

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

export default Dashboard;
