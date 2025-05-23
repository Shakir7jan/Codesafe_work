import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Key, 
  BarChart3,
  MessageSquare,
  PlayCircle,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowRight
} from 'lucide-react';
import GridBackground from '../components/GridBackground';
import CodeSnippet from '../components/CodeSnippet';
import TerminalWindow from '../components/TerminalWindow';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from '../hooks/use-toast';
import { HeroSection } from '../components/hero/HeroSection';
import RadarAnimation from '../components/RadarAnimation';

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const featuresOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };
  
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Request Submitted",
      description: "Thank you for your interest! We'll be in touch soon.",
    });
  };
  
  return (
    <div className="min-h-screen bg-primary-dark text-gray-100 font-sans antialiased overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full bg-primary-dark/90 backdrop-blur-md z-50 border-b border-accent-blue/20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-6xl">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-accent-blue" />
            <span className="text-xl font-bold tracking-tight">CodeSafe<span className="text-accent-blue">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleScrollTo('features')} className="text-gray-300 hover:text-accent-blue transition-colors">Features</button>
            <button onClick={() => handleScrollTo('how-it-works')} className="text-gray-300 hover:text-accent-blue transition-colors">How it Works</button>
            <button onClick={() => handleScrollTo('pricing')} className="text-gray-300 hover:text-accent-blue transition-colors">Pricing</button>
            <button onClick={() => handleScrollTo('about')} className="text-gray-300 hover:text-accent-blue transition-colors">About</button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="hidden md:flex text-gray-300 hover:text-accent-blue transition-colors"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                variant="outline" 
                className="hidden md:flex border-accent-blue text-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue transition-all hover:shadow-lg hover:shadow-accent-blue/20"
              >
                Get Started
              </Button>
            </Link>
            <Button
              className="md:hidden" 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <motion.div 
          className={`md:hidden bg-primary-medium border-t border-accent-blue/20`}
          initial={false}
          animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          <div className="px-4 py-3 space-y-3">
            <button onClick={() => handleScrollTo('features')} className="block w-full text-left text-gray-300 hover:text-accent-blue transition-colors">Features</button>
            <button onClick={() => handleScrollTo('how-it-works')} className="block w-full text-left text-gray-300 hover:text-accent-blue transition-colors">How it Works</button>
            <button onClick={() => handleScrollTo('pricing')} className="block w-full text-left text-gray-300 hover:text-accent-blue transition-colors">Pricing</button>
            <button onClick={() => handleScrollTo('about')} className="block w-full text-left text-gray-300 hover:text-accent-blue transition-colors">About</button>
            <Link href="/login" className="block w-full">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:text-accent-blue transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="block w-full">
              <Button 
                className="w-full bg-accent-blue text-white hover:bg-accent-blue/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* New Hero Section */}
      <HeroSection />

      {/* Clients Section */}
      <section className="py-12 bg-primary-medium/50 backdrop-blur-sm border-y border-accent-blue/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <h3 className="text-center text-gray-400 mb-8">Trusted by innovative companies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-70">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-full text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d={[
                    "M12 2L2 7v10l10 5 10-5V7L12 2zm4.637 5.33l-7.975 3.773-3.301-1.561 7.976-3.773 3.3 1.56zM12 18.25l-7-3.5V9l7 3.5v5.75z",
                    "M2 3h20v18H2V3zm2 2v14h16V5H4zm8 4l.002 6-4-3 3.998-3zm3.983.137L17.5 14.5h-2L14 10l2-1",
                    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2V11h2v6zm0-8h-2V7h2v2z",
                    "M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z",
                    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z",
                    "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
                  ][i % 6]} />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="py-20"
        style={{ opacity: featuresOpacity }}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Advanced Security Features
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our AI-enhanced security platform provides comprehensive protection for web applications of all types.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-6 w-6 text-accent-blue" />,
                title: "AI-Enhanced Scanning",
                description: "Intelligent detection of vulnerabilities tailored for AI-coded and dynamically generated web applications.",
                color: "blue"
              },
              {
                icon: <MessageSquare className="h-6 w-6 text-accent-green" />,
                title: "Adaptive Testing",
                description: "Automatically adjusts testing strategies based on application behavior and structure detected during scanning.",
                color: "green"
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-accent-blue" />,
                title: "Detailed Reporting",
                description: "Comprehensive vulnerability reports with actionable recommendations for fixing detected security issues.",
                color: "blue"
              },
              {
                icon: <Clock className="h-6 w-6 text-accent-green" />,
                title: "Real-Time Scanning",
                description: "Get immediate results with our efficient scanning engine that analyzes your application in real-time.",
                color: "green"
              },
              {
                icon: <Key className="h-6 w-6 text-accent-blue" />,
                title: "Multi-Level Security",
                description: "Detects vulnerabilities at multiple levels including code, network, and user authentication procedures.",
                color: "blue"
              },
              {
                icon: <AlertCircle className="h-6 w-6 text-accent-green" />,
                title: "Compliance Monitoring",
                description: "Ensures your applications meet security standards including OWASP Top 10 and industry regulations.",
                color: "green"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-primary-medium/50 backdrop-blur-sm p-6 rounded-lg border border-accent-blue/20 hover:border-accent-blue/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent-blue/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <div className={`w-12 h-12 bg-accent-${feature.color}/20 rounded-lg flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-primary-medium/30 relative">
        <div className="absolute inset-0 bg-radial-gradient-accent-blue" />
        <GridBackground opacity={0.3} gridSize={25} showDots={true} />
        
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              className="inline-block relative blue-angled-border py-3 px-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 blue-gradient-text">
                How CodeSafe AI Works
              </h2>
            </motion.div>
            <motion.p 
              className="text-lg text-gray-300 mt-4 px-4 py-2 border-l-2 border-r-2 border-accent-blue/30 blue-glow-border inline-block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Advanced security scanning in three simple steps
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Enter Your Web App URL",
                description: "Simply input the URL of your web application. Our system will automatically start crawling and mapping all available endpoints and features."
              },
              {
                step: 2,
                title: "AI-Enhanced Security Scan",
                description: "Our AI technology performs comprehensive security testing, simulating attacks and identifying potential vulnerabilities in your application."
              },
              {
                step: 3,
                title: "Receive Detailed Reports",
                description: "Get comprehensive reports with actionable recommendations to fix vulnerabilities, prioritized by severity and risk level."
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="bg-primary-medium/50 backdrop-blur-sm p-6 rounded-lg border border-accent-blue/20 relative blue-glow-border overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                {/* Decorative diagonal line */}
                <div className="absolute top-0 right-0 h-20 w-20 overflow-hidden">
                  <div className="absolute top-0 right-0 transform rotate-45 bg-gradient-to-r from-accent-blue to-accent-blue-light h-40 w-1 opacity-60" />
                </div>
                
                {/* Step number */}
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center text-xl font-bold blue-glow-border">
                  {step.step}
                </div>
                
                {/* Content illustration */}
                <div className="w-full h-56 rounded-md mb-4 bg-primary-dark/70 flex items-center justify-center overflow-hidden tech-panel">
                  {/* Subtle grid background inside the illustration */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundSize: '20px 20px',
                      backgroundImage: `
                        linear-gradient(to right, var(--accent-blue)/5 1px, transparent 1px),
                        linear-gradient(to bottom, var(--accent-blue)/5 1px, transparent 1px)
                      `,
                      opacity: 0.3
                    }}
                  />
                  
                  {index === 0 && (
                    <div className="w-full h-full py-2 px-4 relative z-10">
                      <TerminalWindow
                        title="Security Scan Setup"
                        lines={[
                          { text: "codesafescanner init", type: "command" },
                          { text: "Initializing security scan...", type: "output" },
                          { text: "Enter target URL:", type: "output" },
                          { text: "https://yourwebapp.com", type: "command" },
                          { text: "Validating target...", type: "output" },
                          { text: "Target validated ✓", type: "success" },
                          { text: "Starting endpoint discovery...", type: "output" }
                        ]}
                        autoType={true}
                        typingSpeed={20}
                        height="100%"
                      />
                    </div>
                  )}
                  
                  {index === 1 && (
                    <div className="w-full h-full py-2 px-4 relative z-10 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20">
                        <RadarAnimation size="100%" className="opacity-30" />
                      </div>
                      
                      <CodeSnippet
                        title="AI Scanner Module"
                        code={`// AI-powered vulnerability detection
class AIScanner extends BaseScanner {
  constructor(target) {
    super(target);
    this.vulnerabilityDb = new VulnerabilityDatabase();
    this.aiModel = new SecurityAIModel();
  }
  
  async scan() {
    console.log("Starting AI-enhanced scan...");
    const endpoints = await this.crawlEndpoints();
    const vulnerabilities = [];
    
    for (const endpoint of endpoints) {
      const prediction = this.aiModel.predict(endpoint);
      if (prediction.riskScore > 0.7) {
        vulnerabilities.push({
          endpoint,
          riskLevel: "high",
          description: prediction.description
        });
      }
    }
    
    return vulnerabilities;
  }
}`}
                        language="javascript"
                        maxHeight="100%"
                      />
                    </div>
                  )}
                  
                  {index === 2 && (
                    <div className="w-full h-full p-2 relative z-10 flex flex-col">
                      <div className="bg-primary-medium/80 p-3 rounded-t-md border-b border-accent-blue/20 flex items-center">
                        <div className="h-3 w-3 rounded-full bg-accent-red mr-2 animate-pulse"></div>
                        <div className="text-sm font-semibold text-accent-blue-light">Vulnerability Report</div>
                      </div>
                      
                      <div className="flex-1 p-3 text-sm overflow-y-auto">
                        <div className="mb-3">
                          <div className="flex items-center text-red-500 mb-1">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="font-medium">High Severity (3)</span>
                          </div>
                          <div className="pl-5 text-gray-300">
                            <div className="mb-1">• SQL Injection at /api/users</div>
                            <div className="mb-1">• Insecure Authentication</div>
                            <div>• XSS Vulnerability at /comments</div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center text-yellow-500 mb-1">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="font-medium">Medium Severity (2)</span>
                          </div>
                          <div className="pl-5 text-gray-300">
                            <div className="mb-1">• CSRF at /profile/update</div>
                            <div>• Insecure Cookie Attributes</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center text-green-500 mb-1">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="font-medium">Passed Tests (15)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-2 blue-gradient-text">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button
              onClick={scrollToContact}
              className="bg-gradient-to-r from-accent-blue to-accent-blue-dark text-white font-semibold shadow-lg shadow-accent-blue/20 hover:shadow-xl hover:shadow-accent-blue/30 transition-all blue-glow-border-lg"
              size="lg"
            >
              Start Your First Scan
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">See CodeSafe AI in Action</h2>
              <p className="text-lg text-gray-300 mb-6">
                Watch how our platform detects vulnerabilities in real-time, providing actionable insights to secure your web applications.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "AI-powered scanning designed specifically for modern web apps",
                  "Detects OWASP Top 10 vulnerabilities and beyond",
                  "Special focus on AI-coded and \"vibe-coded\" applications"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-accent-green mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="link" className="text-accent-blue hover:text-accent-blue/80 transition-colors p-0">
                <span>View full documentation</span>
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 bg-primary-medium/50 backdrop-blur-sm p-2 rounded-lg border border-accent-blue/20"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-video rounded-md overflow-hidden relative bg-primary-dark tech-panel">
                {/* Background grid effect */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundSize: '20px 20px',
                    backgroundImage: `
                      linear-gradient(to right, var(--accent-blue)/5 1px, transparent 1px),
                      linear-gradient(to bottom, var(--accent-blue)/5 1px, transparent 1px)
                    `,
                    opacity: 0.3
                  }}
                />
                
                <div className="absolute inset-0 p-3">
                  <TerminalWindow
                    title="Live Security Scan Demo"
                    lines={[
                      { text: "codesafescan --target https://example-ecommerce.com --mode ai-enhanced", type: "command" },
                      { text: "Initializing AI-enhanced security scan...", type: "output" },
                      { text: "Loading vulnerability database... done", type: "output" },
                      { text: "Starting crawler module...", type: "output" },
                      { text: "Discovered 24 endpoints", type: "success" },
                      { text: "Analyzing endpoint: /api/products", type: "output" },
                      { text: "Analyzing endpoint: /api/users/login", type: "output" },
                      { text: "Analyzing endpoint: /api/cart", type: "output" },
                      { text: "CRITICAL VULNERABILITY DETECTED: SQL Injection at /api/products?category=1", type: "error" },
                      { text: "Scanning authentication mechanisms...", type: "output" },
                      { text: "VULNERABILITY DETECTED: Weak password policy", type: "error" },
                      { text: "Analyzing session management...", type: "output" },
                      { text: "VULNERABILITY DETECTED: Insecure session cookies", type: "error" },
                      { text: "AI Analysis: 3 high severity issues detected", type: "output" },
                      { text: "Generating detailed report with remediation steps...", type: "output" },
                      { text: "Report completed. View at: https://codesafe.ai/reports/ec12fd", type: "success" }
                    ]}
                    prompt="$"
                    autoType={true}
                    typingSpeed={30}
                    height="100%"
                    blinkCursor={true}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-primary-medium/30 relative">
        <div className="absolute inset-0 bg-radial-gradient-accent-blue" />
        <GridBackground opacity={0.12} />
        
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Choose the plan that fits your security needs
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$49",
                description: "Perfect for small projects and startups",
                features: [
                  { name: "5 scans per month", included: true },
                  { name: "Basic vulnerability detection", included: true },
                  { name: "PDF reports", included: true },
                  { name: "AI-enhanced analysis", included: false },
                  { name: "Advanced remediation", included: false }
                ],
                buttonText: "Get Started",
                highlighted: false
              },
              {
                name: "Professional",
                price: "$129",
                description: "For growing businesses and serious developers",
                features: [
                  { name: "20 scans per month", included: true },
                  { name: "Advanced vulnerability detection", included: true },
                  { name: "Interactive reports", included: true },
                  { name: "AI-enhanced analysis", included: true },
                  { name: "Priority support", included: false }
                ],
                buttonText: "Get Started",
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "$299",
                description: "For large organizations with complex needs",
                features: [
                  { name: "Unlimited scans", included: true },
                  { name: "Enterprise-grade security", included: true },
                  { name: "Custom reporting", included: true },
                  { name: "AI-enhanced analysis", included: true },
                  { name: "Priority support", included: true }
                ],
                buttonText: "Contact Sales",
                highlighted: false
              }
            ].map((plan, index) => (
              <motion.div 
                key={index}
                className={`
                  ${plan.highlighted 
                    ? 'bg-primary-medium/70 border-2 border-accent-blue relative transform hover:scale-105 hover:shadow-xl hover:shadow-accent-blue/20' 
                    : 'bg-primary-medium/50 border border-accent-blue/20 hover:border-accent-blue/40 hover:shadow-lg hover:shadow-accent-blue/10'
                  } 
                  backdrop-blur-sm p-6 rounded-lg transition-all duration-300
                `}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent-blue text-white text-sm font-bold py-1 px-4 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-1">{plan.price}<span className="text-lg font-normal text-gray-400">/month</span></div>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      {feature.included ? (
                        <CheckCircle className="h-5 w-5 text-accent-green mr-2 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-gray-400'}>{feature.name}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={scrollToContact}
                  className={plan.highlighted 
                    ? "w-full bg-gradient-to-r from-accent-blue to-accent-blue-dark text-white font-semibold shadow-lg shadow-accent-blue/20 hover:shadow-xl hover:shadow-accent-blue/30 transition-all blue-glow-border" 
                    : "w-full bg-primary-light hover:bg-primary-light/80"
                  }
                >
                  {plan.buttonText}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              What Our Customers Say
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Hear from developers and businesses using CodeSafe AI
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                review: "CodeSafe AI detected critical vulnerabilities in our AI-generated web app that we would have missed. The detailed reports helped us fix issues quickly before launch.",
                name: "Sarah Johnson",
                role: "CTO, TechStart",
                initials: "SJ"
              },
              {
                review: "As a non-technical founder using AI to build my startup's website, CodeSafe AI was a game-changer. It's easy to use and the reports are clear even for someone without a security background.",
                name: "Michael Chang",
                role: "Founder, EcoVision",
                initials: "MC"
              },
              {
                review: "We needed a solution that could keep up with our rapid development cycles. CodeSafe AI integrates perfectly with our CI/CD pipeline, ensuring security at every stage of deployment.",
                name: "Elena Rodriguez",
                role: "DevOps Lead, CloudFlex",
                initials: "ER"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-primary-medium/50 backdrop-blur-sm p-6 rounded-lg border border-accent-blue/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-accent-blue fill-accent-blue" />
                  ))}
                </div>
                <p className="mb-4 text-gray-300">{testimonial.review}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center mr-3">
                    <span>{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="contact" className="py-20 bg-primary-medium/30 relative" ref={contactRef}>
        <div className="absolute inset-0 bg-radial-gradient-accent-blue" />
        <GridBackground opacity={0.12} />
        
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Get Started with Your Free Security Scan
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-300 mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Identify vulnerabilities in your web applications with our comprehensive 
              AI-enhanced security scan, built on ZAP technology.
            </motion.p>
            
            <motion.div
              className="max-w-md mx-auto bg-primary-medium/60 backdrop-blur-md p-8 rounded-lg border border-accent-blue/30 shadow-lg shadow-accent-blue/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <form onSubmit={handleSubmitForm} className="space-y-5">
                <div>
                  <Input 
                    id="website" 
                    type="url" 
                    className="bg-primary-dark border-accent-blue/30 text-white focus:ring-2 focus:ring-accent-blue py-6" 
                    placeholder="https://yourwebsite.com" 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-accent-blue to-accent-blue-dark text-white font-semibold py-6 text-lg shadow-lg shadow-accent-blue/20 hover:shadow-xl hover:shadow-accent-blue/30 transition-all blue-glow-border flex items-center justify-center gap-2"
                >
                  Start Free Security Scan
                  <ArrowRight className="h-5 w-5" />
                </Button>
                
                <p className="text-sm text-gray-400 text-center">
                  No credit card required. Get your security report in minutes.
                </p>
              </form>
            </motion.div>
            
            <motion.div
              className="flex items-center justify-center gap-8 mt-12 flex-wrap"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent-green" />
                <span className="text-gray-300">Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent-green" />
                <span className="text-gray-300">AI-Enhanced Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent-green" />
                <span className="text-gray-300">Detailed Reports</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark pt-16 pb-8 border-t border-accent-blue/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <Link to="/terms-of-service" className="text-gray-400 hover:text-accent-blue transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="text-gray-400 hover:text-accent-blue transition-colors">
              Privacy Policy
            </Link>
            <Link to="/blog" className="text-gray-400 hover:text-accent-blue transition-colors">
              Blog
            </Link>
            <a 
              href="#contact" 
              onClick={(e) => {
                e.preventDefault();
                handleScrollTo('contact');
              }}
              className="text-gray-400 hover:text-accent-blue transition-colors"
            >
              Contact
            </a>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-accent-blue/10">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-8 w-8 text-accent-blue mr-2" />
              <span className="text-xl font-bold tracking-tight">CodeSafe<span className="text-accent-blue">AI</span></span>
            </div>
          </div>
          
          <div className="text-center text-gray-500 text-sm mt-8">
            &copy; {new Date().getFullYear()} CodeSafe AI. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Add custom styling */}
      <style>{`
        .bg-radial-gradient-accent-blue {
          background: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.1), transparent 70%);
        }
        
        .circuit-line {
          position: absolute;
          background-color: rgba(56, 189, 248, 0.2);
        }
        
        @keyframes radar-scan {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .text-accent-blue {
          color: hsl(var(--accent-blue));
        }
        
        .text-accent-green {
          color: hsl(var(--accent-green));
        }
        
        .text-accent-red {
          color: hsl(var(--accent-red));
        }
        
        .bg-accent-blue {
          background-color: hsl(var(--accent-blue));
        }
        
        .bg-accent-green {
          background-color: hsl(var(--accent-green));
        }
        
        .bg-accent-red {
          background-color: hsl(var(--accent-red));
        }
        
        .bg-accent-blue\/20 {
          background-color: hsla(var(--accent-blue), 0.2);
        }
        
        .bg-accent-green\/20 {
          background-color: hsla(var(--accent-green), 0.2);
        }
        
        .bg-accent-red\/20 {
          background-color: hsla(var(--accent-red), 0.2);
        }
        
        .border-accent-blue {
          border-color: hsl(var(--accent-blue));
        }
        
        .border-accent-blue\/20 {
          border-color: hsla(var(--accent-blue), 0.2);
        }
        
        .border-accent-blue\/40 {
          border-color: hsla(var(--accent-blue), 0.4);
        }
        
        .bg-primary-dark {
          background-color: hsl(var(--primary-dark));
        }
        
        .bg-primary-medium {
          background-color: hsl(var(--primary-medium));
        }
        
        .bg-primary-light {
          background-color: hsl(var(--primary-light));
        }
        
        .fill-accent-blue {
          fill: hsl(var(--accent-blue));
        }
      `}</style>
    </div>
  );
};

export default Home;
