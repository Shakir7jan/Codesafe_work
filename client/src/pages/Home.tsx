import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Key, 
  BarChart3,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  PlayCircle,
  ChevronRight,
  Menu,
  X,
  Star
} from 'lucide-react';
import RadarAnimation from '../components/RadarAnimation';
import CircuitBackground from '../components/CircuitBackground';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from '../hooks/use-toast';

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
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-accent-blue" />
            <span className="text-xl font-bold tracking-tight">SecureScan<span className="text-accent-blue">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleScrollTo('features')} className="text-gray-300 hover:text-accent-blue transition-colors">Features</button>
            <button onClick={() => handleScrollTo('how-it-works')} className="text-gray-300 hover:text-accent-blue transition-colors">How it Works</button>
            <button onClick={() => handleScrollTo('pricing')} className="text-gray-300 hover:text-accent-blue transition-colors">Pricing</button>
            <button onClick={() => handleScrollTo('about')} className="text-gray-300 hover:text-accent-blue transition-colors">About</button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={scrollToContact} 
              variant="outline" 
              className="hidden md:flex border-accent-blue text-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue transition-all hover:shadow-lg hover:shadow-accent-blue/20"
            >
              Get Started
            </Button>
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
            <Button 
              onClick={scrollToContact}
              className="w-full bg-accent-blue text-white hover:bg-accent-blue/90"
            >
              Get Started
            </Button>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient-accent-blue" />
        <CircuitBackground density="low" />
        
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6 z-10">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span>Secure Your Web Apps</span>
              <span className="block text-accent-blue">With AI-Enhanced Security Scans</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 md:pr-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Identify vulnerabilities in AI-generated and traditional web apps with our 
              comprehensive security scanning solution built on ZAP technology.
            </motion.p>
            
            <motion.div 
              className="pt-4 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
                onClick={scrollToContact}
                className="bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold hover:shadow-lg hover:shadow-accent-blue/20 transition-all"
                size="lg"
              >
                Start Free Scan
              </Button>
              <Button 
                onClick={() => handleScrollTo('how-it-works')}
                variant="outline" 
                className="border-accent-blue/60 text-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue transition-all"
                size="lg"
              >
                See How It Works
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-x-2 pt-6"
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
          
          <motion.div 
            className="md:w-1/2 flex justify-center mt-10 md:mt-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
            >
              <RadarAnimation />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-12 bg-primary-medium/50 backdrop-blur-sm border-y border-accent-blue/10">
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
        <CircuitBackground density="medium" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              How SecureScan AI Works
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-300"
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
                className="bg-primary-medium/50 backdrop-blur-sm p-6 rounded-lg border border-accent-blue/20 relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <div className="w-full h-48 rounded-md mb-4 bg-primary-dark/50 flex items-center justify-center">
                  {index === 0 && (
                    <div className="text-accent-blue text-lg p-4 border border-accent-blue/30 rounded-md">
                      https://yourwebapp.com
                    </div>
                  )}
                  {index === 1 && (
                    <div className="w-2/3 h-2/3 relative">
                      <div className="absolute inset-0 border-2 border-accent-green/30 rounded-md animate-pulse" />
                      <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-accent-red/50 rounded-full animate-ping" />
                      <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-accent-red/50 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                    </div>
                  )}
                  {index === 2 && (
                    <div className="w-2/3 space-y-2">
                      <div className="h-4 bg-accent-blue/20 rounded w-full" />
                      <div className="h-4 bg-accent-blue/20 rounded w-5/6" />
                      <div className="h-4 bg-accent-red/40 rounded w-4/6" />
                      <div className="h-4 bg-accent-blue/20 rounded w-full" />
                      <div className="h-4 bg-accent-green/30 rounded w-3/6" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button
              onClick={scrollToContact}
              className="bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold hover:shadow-lg hover:shadow-accent-blue/20 transition-all"
              size="lg"
            >
              Start Your First Scan
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">See SecureScan AI in Action</h2>
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
              <div className="aspect-video rounded-md overflow-hidden relative bg-primary-dark flex items-center justify-center">
                <div className="absolute inset-0 bg-primary-dark/70" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="icon"
                    className="w-16 h-16 rounded-full bg-accent-blue/90 hover:bg-accent-blue hover:scale-110 transition-transform"
                  >
                    <PlayCircle className="h-8 w-8 text-white" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-primary-medium/30 relative">
        <div className="absolute inset-0 bg-radial-gradient-accent-blue" />
        <CircuitBackground density="low" />
        
        <div className="container mx-auto px-4 relative z-10">
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
                    ? "w-full bg-accent-blue hover:bg-accent-blue/90" 
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
        <div className="container mx-auto px-4">
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
              Hear from developers and businesses using SecureScan AI
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                review: "SecureScan AI detected critical vulnerabilities in our AI-generated web app that we would have missed. The detailed reports helped us fix issues quickly before launch.",
                name: "Sarah Johnson",
                role: "CTO, TechStart",
                initials: "SJ"
              },
              {
                review: "As a non-technical founder using AI to build my startup's website, SecureScan AI was a game-changer. It's easy to use and the reports are clear even for someone without a security background.",
                name: "Michael Chang",
                role: "Founder, EcoVision",
                initials: "MC"
              },
              {
                review: "We needed a solution that could keep up with our rapid development cycles. SecureScan AI integrates perfectly with our CI/CD pipeline, ensuring security at every stage of deployment.",
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-primary-medium/30 relative" ref={contactRef}>
        <div className="absolute inset-0 bg-radial-gradient-accent-blue" />
        <CircuitBackground density="medium" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Start Securing Your Web Applications Today
              </motion.h2>
              <motion.p 
                className="text-lg text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Fill out the form to begin your security journey or schedule a demo with our team to learn more about our advanced security features.
              </motion.p>
              
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-accent-blue mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-300">support@securescanai.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-accent-blue mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-gray-300">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-accent-blue mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Office</h3>
                    <p className="text-gray-300">123 Security Avenue, Tech District</p>
                    <p className="text-gray-300">San Francisco, CA 94105</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-primary-medium/50 backdrop-blur-sm border-accent-blue/20">
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-6">Get Started</h3>
                  
                  <form onSubmit={handleSubmitForm} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-gray-300 mb-2">Full Name</label>
                      <Input 
                        id="name" 
                        className="bg-primary-dark border-accent-blue/20 text-white focus:ring-2 focus:ring-accent-blue" 
                        placeholder="John Doe" 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-300 mb-2">Email Address</label>
                      <Input 
                        id="email" 
                        type="email" 
                        className="bg-primary-dark border-accent-blue/20 text-white focus:ring-2 focus:ring-accent-blue" 
                        placeholder="your@email.com" 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-gray-300 mb-2">Company</label>
                      <Input 
                        id="company" 
                        className="bg-primary-dark border-accent-blue/20 text-white focus:ring-2 focus:ring-accent-blue" 
                        placeholder="Your Company" 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="website" className="block text-gray-300 mb-2">Website URL</label>
                      <Input 
                        id="website" 
                        type="url" 
                        className="bg-primary-dark border-accent-blue/20 text-white focus:ring-2 focus:ring-accent-blue" 
                        placeholder="https://yourwebsite.com" 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
                      <Textarea 
                        id="message" 
                        rows={4} 
                        className="bg-primary-dark border-accent-blue/20 text-white focus:ring-2 focus:ring-accent-blue" 
                        placeholder="Tell us about your security needs..." 
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold hover:shadow-lg hover:shadow-accent-blue/20 transition-all"
                    >
                      Submit Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark pt-16 pb-8 border-t border-accent-blue/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              {
                title: "Product",
                links: [
                  { name: "Features", href: "#features" },
                  { name: "Pricing", href: "#pricing" },
                  { name: "Demo", href: "#" },
                  { name: "Documentation", href: "#" }
                ]
              },
              {
                title: "Company",
                links: [
                  { name: "About Us", href: "#about" },
                  { name: "Careers", href: "#" },
                  { name: "Blog", href: "#" },
                  { name: "Contact", href: "#contact" }
                ]
              },
              {
                title: "Resources",
                links: [
                  { name: "Security Guide", href: "#" },
                  { name: "API Documentation", href: "#" },
                  { name: "Community", href: "#" },
                  { name: "Support", href: "#" }
                ]
              },
              {
                title: "Legal",
                links: [
                  { name: "Privacy Policy", href: "#" },
                  { name: "Terms of Service", href: "#" },
                  { name: "Compliance", href: "#" },
                  { name: "Security Policy", href: "#" }
                ]
              }
            ].map((column, colIndex) => (
              <div key={colIndex}>
                <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href={link.href} 
                        onClick={(e) => {
                          e.preventDefault();
                          if (link.href.startsWith('#')) {
                            handleScrollTo(link.href.substring(1));
                          }
                        }}
                        className="text-gray-400 hover:text-accent-blue transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-accent-blue/10">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-8 w-8 text-accent-blue mr-2" />
              <span className="text-xl font-bold tracking-tight">SecureScan<span className="text-accent-blue">AI</span></span>
            </div>
            
            <div className="flex space-x-4">
              {/* Social media links */}
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-accent-blue transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-accent-blue transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-accent-blue transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </Button>
            </div>
          </div>
          
          <div className="text-center text-gray-500 text-sm mt-8">
            &copy; {new Date().getFullYear()} SecureScan AI. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Add custom styling */}
      <style jsx global>{`
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
