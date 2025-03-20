import { RadarScan } from "../ui/RadarScan";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-primary-dark">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-accent-blue/10 rounded-full">
              <span className="text-accent-blue font-semibold text-sm">
                Secure Your Web Applications
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              AI-powered <span className="text-accent-blue">security</span> for your code
            </h1>
            
            <p className="text-lg text-gray-400 max-w-lg">
              CodeSafe helps you identify vulnerabilities in both AI-generated and traditional web applications, providing detailed reports and remediation guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white px-8 py-6">
                Get Started
              </Button>
              <Button variant="outline" className="border-accent-blue text-accent-blue hover:bg-accent-blue/10 px-8 py-6">
                Learn More
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-blue" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-blue" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>No credit card required</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Radar Scan */}
          <div className="relative flex justify-center">
            <div className="absolute -inset-6 bg-accent-blue/5 blur-xl rounded-full"></div>
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
              <div className="absolute -top-4 -right-4 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono text-white">Firewall Active</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono text-white">Scanning in progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl"></div>
    </div>
  );
} 