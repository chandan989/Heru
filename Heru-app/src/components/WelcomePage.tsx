import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Shield, Scroll, Globe, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import heruLogo from "@/assets/heru-logo.svg";

// Custom Cursor Component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();

    const mouseMoveHandler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const mouseEnterHandler = () => setIsHovering(true);
    const mouseLeaveHandler = () => setIsHovering(false);

    if (!isTouchDevice) {
      document.addEventListener('mousemove', mouseMoveHandler);
      
      const interactiveElements = document.querySelectorAll('a, button');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', mouseEnterHandler);
        el.addEventListener('mouseleave', mouseLeaveHandler);
      });

      return () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        interactiveElements.forEach(el => {
          el.removeEventListener('mouseenter', mouseEnterHandler);
          el.removeEventListener('mouseleave', mouseLeaveHandler);
        });
      };
    }
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      className={`fixed pointer-events-none z-[10000] rounded-full ${
        isHovering ? 'w-10 h-10 bg-primary/20' : 'w-5 h-5 bg-primary/50'
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
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
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

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.button
      className={`fixed bottom-6 right-6 z-[9998] bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-violet hover:glow-divine transition-all duration-300 ${
        isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
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
const AnimatedSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
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

const WelcomePage = () => {
  const navigate = useNavigate();

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

      {/* The Beginning - Hero Section */}
      <section className="relative z-[2] min-h-screen flex items-center justify-center hero-bg text-center story-chunk px-4 sm:px-6">
        <div className="container mx-auto">
          <AnimatedSection delay={0.1}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6">
              <img src={heruLogo} alt="Eye of Horus Logo" className="w-full h-full animate-divine-float" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
              The Divine Guardian of Medical Cold Chain
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.5}>
            <p className="text-lg sm:text-xl md:text-xl max-w-3xl mx-auto text-muted-foreground mb-8">
              Named after the ancient Egyptian falcon god of protection, Heru ensures every vial of medicine maintains its divine power from source to patient.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.7}>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                variant="pharaoh"
                size="xl"
                onClick={() => navigate('/verify')}
                className="w-full transform sm:w-auto transition-transform duration-300 hover:scale-105"
              >
                Eye of Horus
              </Button>
              {/*<Button*/}
              {/*  variant="oracle"*/}
              {/*  size="xl"*/}
              {/*  className="w-full transform sm:w-auto transition-transform duration-300 hover:scale-105 hover:shadow-violet"*/}
              {/*>*/}
              {/*  Sacred Scrolls*/}
              {/*</Button>*/}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* The Desert's Curse - Problem Section */}
      <section className="relative z-[2] py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h3 className="text-base sm:text-lg font-semibold uppercase text-primary tracking-widest">The Sacred Problem</h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2">The Desert's Curse on Modern Medicine</h2>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
              Up to 25% of vaccines are degraded by the time they arrive due to improper shipping. Precious medicines face perils that threaten millions of lives.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection delay={0.2}>
              <Card className="p-6 sm:p-8 text-center bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                <div className="text-4xl sm:text-5xl mb-4">🌡️</div>
                <h4 className="text-xl sm:text-2xl font-bold mb-2">Temperature Exposure</h4>
                <p className="text-muted-foreground">Like papyrus in the sun, vaccines lose their healing power when the sacred cold is broken.</p>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <Card className="p-6 sm:p-8 text-center bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                <div className="text-4xl sm:text-5xl mb-4">👥</div>
                <h4 className="text-xl sm:text-2xl font-bold mb-2">False Guardians</h4>
                <p className="text-muted-foreground">Counterfeit medicines, as dangerous as tomb robbers, infiltrate the sacred supply chain.</p>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* A Journey Fraught with Peril */}
      <section className="relative z-[2] py-20 px-4 sm:px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <AnimatedSection className="md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2 mb-8">A Journey Fraught with Peril</h2>
            <Card className="p-6 sm:p-8 bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
              <div className="text-4xl sm:text-5xl mb-4">👁️</div>
              <h4 className="text-xl sm:text-2xl font-bold mb-2">Blind Spots</h4>
              <p className="text-muted-foreground">No divine eye to watch over the cargo leaves its journey vulnerable and untracked.</p>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="md:w-1/2 w-full">
            <Card className="p-6 sm:p-8 text-center bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
              <div className="text-4xl sm:text-5xl mb-4">⚰️</div>
              <h4 className="text-xl sm:text-2xl font-bold mb-2">Lost Treasures</h4>
              <p className="text-muted-foreground">Wasted resources, endangered lives, and broken trust—a plague upon the land.</p>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* The Divine Prophecy - Timeline */}
      <section className="relative z-[2] py-20 px-4 sm:px-6 ">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h3 className="text-base sm:text-lg font-semibold uppercase text-primary tracking-widest">The Divine Prophecy</h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2">A Glimpse into the Future</h2>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
              This is the path Heru will walk, a sacred journey in three phases to bring divine protection to all.
            </p>
          </AnimatedSection>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-0.5 bg-primary/30 transform -translate-x-1/2"></div>

            {/* Timeline Items */}
            <div className="space-y-12 md:space-y-0">
              {/* Phase 1 */}
              <div className="relative md:grid md:grid-cols-2 md:gap-12 items-center">
                <div className="md:col-start-2">
                  <AnimatedSection delay={0.2}>
                    <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                      <h4 className="text-xl font-bold mb-2 text-warning">Phase I: The Awakening</h4>
                      <p className="text-sm text-muted-foreground mb-4">Q4 2025</p>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start"><span className="mr-2">🌡️</span><span>Live temple hardware integration</span></li>
                        <li className="flex items-start"><span className="mr-2">👑</span><span>Multi-realm dashboards</span></li>
                        <li className="flex items-start"><span className="mr-2">👤</span><span>DID integration for participants</span></li>
                        <li className="flex items-start"><span className="mr-2">📱</span><span>Mobile temple (PWA) for offline access</span></li>
                      </ul>
                    </Card>
                  </AnimatedSection>
                </div>
                <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-primary shadow-violet"></div>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="relative md:grid md:grid-cols-2 md:gap-12 items-center">
                <div className="md:col-start-1 md:text-right">
                  <AnimatedSection delay={0.4}>
                    <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                      <h4 className="text-xl font-bold mb-2 text-success">Phase II: The Expansion</h4>
                      <p className="text-sm text-muted-foreground mb-4">Q1 2026</p>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start md:justify-end"><span className="md:order-2 md:ml-2">⚡</span><span className="md:order-1">Divine contract-triggered alerts</span></li>
                        <li className="flex items-start md:justify-end"><span className="md:order-2 md:ml-2">🏥</span><span className="md:order-1">Sacred pilot with a healing temple</span></li>
                        <li className="flex items-start md:justify-end"><span className="md:order-2 md:ml-2">📊</span><span className="md:order-1">Advanced prophecies on efficiency</span></li>
                      </ul>
                    </Card>
                  </AnimatedSection>
                </div>
                <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-primary shadow-violet"></div>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="relative md:grid md:grid-cols-2 md:gap-12 items-center">
                <div className="md:col-start-2">
                  <AnimatedSection delay={0.6}>
                    <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                      <h4 className="text-xl font-bold mb-2 text-success">Phase III: The Great Healing</h4>
                      <p className="text-sm text-muted-foreground mb-4">Q2 2026</p>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start"><span className="mr-2">🏛️</span><span>Integration with health information systems</span></li>
                        <li className="flex items-start"><span className="mr-2">🤖</span><span>AI-powered route optimization</span></li>
                        <li className="flex items-start"><span className="mr-2">📋</span><span>Full compliance with regulations</span></li>
                      </ul>
                    </Card>
                  </AnimatedSection>
                </div>
                <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-primary shadow-violet"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Four Pillars of Protection */}
      <section className="relative z-[2] py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <h3 className="text-base sm:text-lg font-semibold uppercase text-primary tracking-widest">Our Foundation</h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2">The Four Pillars of Protection</h2>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
            <AnimatedSection delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <div className="text-5xl sm:text-6xl">𓅃</div>
                <Card className="p-6 flex-1 text-center sm:text-left bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                  <h4 className="text-xl sm:text-2xl font-bold mb-2">Divine Sealing</h4>
                  <p className="text-muted-foreground">Each medicine batch receives Heru's protective seal (NFT) using the Hedera Token Service.</p>
                </Card>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="flex flex-col sm:flex-row-reverse items-center gap-4 sm:gap-8">
                <div className="text-5xl sm:text-6xl">⚖️</div>
                <Card className="p-6 flex-1 text-center sm:text-right bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                  <h4 className="text-xl sm:text-2xl font-bold mb-2">Sacred Laws</h4>
                  <p className="text-muted-foreground">Ancient wisdom encoded as immutable policies via Hedera Guardian.</p>
                </Card>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.6}>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <div className="text-5xl sm:text-6xl">👁️</div>
                <Card className="p-6 flex-1 text-center sm:text-left bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                  <h4 className="text-xl sm:text-2xl font-bold mb-2">All-Seeing Eye</h4>
                  <p className="text-muted-foreground">Constant vigilance over temperature and location through IoT Temple Sensors.</p>
                </Card>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.8}>
              <div className="flex flex-col sm:flex-row-reverse items-center gap-4 sm:gap-8">
                <div className="text-5xl sm:text-6xl">📜</div>
                <Card className="p-6 flex-1 text-center sm:text-right bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                  <h4 className="text-xl sm:text-2xl font-bold mb-2">Eternal Record</h4>
                  <p className="text-muted-foreground">Priests of healing access the complete, unalterable history with the Mobile Oracle.</p>
                </Card>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Sacred Powers Bestowed */}
      <section className="relative z-[2] py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h3 className="text-base sm:text-lg font-semibold uppercase text-primary tracking-widest">Our Capabilities</h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2">Sacred Powers Bestowed</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection delay={0.2}>
              <Card className="p-6 sm:p-8 text-center bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                <div className="text-4xl sm:text-5xl mb-4">🌡️</div>
                <h4 className="text-xl sm:text-2xl font-bold mb-2">Temperature Sanctity</h4>
                <p className="text-muted-foreground">Heru's sentinels monitor the sacred cold via IoT sensors streaming data to Guardian policies.</p>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <Card className="p-6 sm:p-8 text-center bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                <div className="text-4xl sm:text-5xl mb-4">🛡️</div>
                <h4 className="text-xl sm:text-2xl font-bold mb-2">Authenticity Seal</h4>
                <p className="text-muted-foreground">Each medicine is tokenized at its source, bearing the mark of truth and protecting it from false copies.</p>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Divine Intervention */}
      <section className="relative z-[2] py-20 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <AnimatedSection className="mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2">Divine Intervention</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection delay={0.2}>
              <Card className="p-6 sm:p-8 text-center bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                <div className="text-4xl sm:text-5xl mb-4">⚡</div>
                <h4 className="text-xl sm:text-2xl font-bold mb-2">Divine Warnings</h4>
                <p className="text-muted-foreground">Receive instant messages from the gods. Automatic alerts are sent when sacred conditions are broken.</p>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <Card className="p-6 sm:p-8 text-center bg-card/20 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:glow-divine">
                <div className="text-4xl sm:text-5xl mb-4">📜</div>
                <h4 className="text-xl sm:text-2xl font-bold mb-2">Eternal Wisdom</h4>
                <p className="text-muted-foreground">The complete story, written in stone. An immutable audit trail for pharaohs and healers.</p>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Begin Your Sacred Quest - CTA */}
      <section className="relative z-[2] py-20 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <AnimatedSection>
            <Card className="bg-primary/10 py-12 sm:py-16 px-6 sm:px-8 border-primary/40 backdrop-blur-md">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Begin Your Sacred Quest</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join the sacred order. Explore our divine scrolls on GitHub and help us build a world where every medicine is safe and trusted.
              </p>
              <Button variant="divine" size="xl" className="animate-divine-glow" onClick={() => navigate('/dashboard')}>
                Enter the Divine Realm
              </Button>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-[2] border-t border-primary/30 py-8 sm:py-12">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={heruLogo} alt="Eye of Horus Logo" className="w-10 h-10" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-foreground">Heru</h1>
          </div>
          <p className="mb-4 text-sm sm:text-base">Crafted with divine love for a healed world. 𓅃</p>
          <p className="text-xs sm:text-sm">&copy; 2025 Heru. The eternal guardian watches over healing's sacred journey. May the falcon's eye guide you. 🦅</p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;