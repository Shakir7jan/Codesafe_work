import { RadarScan } from "../ui/RadarScan";
import { Button } from "../ui/button";
import GridBackground from "../GridBackground";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-radial-gradient-accent-blue" />
      <GridBackground opacity={0.3} gridSize={30} />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 z-10 text-center md:text-left">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-blue to-accent-blue-light opacity-70"></div>
              <div className="inline-block px-4 py-2 bg-accent-blue/10 rounded-full">
                <span className="text-accent-blue font-semibold text-sm">
                  Secure Your Web Applications
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-4 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-300">AI-powered</span>
                <span className="block blue-gradient-text">Security Scanning</span>
              </h1>
            </motion.div>
            
            <motion.div
              className="relative blue-highlight-bar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-lg text-gray-300 md:pr-10">
                CodeSafe helps you identify vulnerabilities in both AI-generated and traditional web applications, providing detailed reports and remediation guidance.
              </p>
            </motion.div>
            
            <motion.div 
              className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/signup">
                <Button 
                  className="bg-gradient-to-r from-accent-blue to-accent-blue-dark text-white font-semibold shadow-lg shadow-accent-blue/20 hover:shadow-xl hover:shadow-accent-blue/30 transition-all blue-glow-border-lg"
                  size="lg"
                >
                  Start Free Scan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="border-accent-blue text-accent-blue-light hover:bg-accent-blue/10 hover:text-accent-blue-light transition-all blue-glow-border"
                size="lg"
              >
                See How It Works
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-x-2 pt-6 justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-accent-blue/30 flex items-center justify-center border-2 border-primary-dark">
                  <span className="text-xs">JD</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent-green/30 flex items-center justify-center border-2 border-primary-dark">
                  <span className="text-xs">RB</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent-red/30 flex items-center justify-center border-2 border-primary-dark">
                  <span className="text-xs">MS</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Trusted by <span className="text-white font-medium">2,500+</span> developers</p>
            </motion.div>
          </div>
          
          {/* Right Column - Radar Scan */}
          <motion.div 
            className="flex justify-center mt-12 md:mt-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
              className="relative"
            >
              {/* Glow effect behind radar */}
              <div className="absolute -inset-4 bg-accent-blue/5 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <RadarScan 
                  size={400} 
                  dotColor="#3b82f6"
                  beamColor="rgba(59, 130, 246, 0.5)"
                  backgroundColor="#0f172a"
                  scanSpeed={4}
                  className="shadow-2xl shadow-accent-blue/20"
                />
                
                {/* Floating security elements */}
                <div className="absolute top-0 -right-4 sm:right-0 bg-accent-blue/10 px-3 py-1 rounded-full text-xs font-mono text-accent-blue-light border border-accent-blue/30 animate-pulse">
                  Scan in progress...
                </div>
                <div className="absolute -bottom-2 -left-4 sm:left-0 bg-red-500/10 px-3 py-1 rounded-full text-xs font-mono text-red-400 border border-red-500/30 animate-pulse" style={{ animationDelay: '1s' }}>
                  Threats detected
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl"></div>
    </section>
  );
} 