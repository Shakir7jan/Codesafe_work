import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import GridBackground from '../components/GridBackground';
import { toast } from '../hooks/use-toast';

const Contact: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Message sent",
      description: "Thank you for your message. We'll get back to you soon.",
    });
    // In a real app, we would send the form data to the server
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-primary-dark text-gray-100 font-sans antialiased">
      <GridBackground opacity={0.08} />

      {/* Header */}
      <header className="bg-primary-dark/90 border-b border-accent-blue/20 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-accent-blue flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-lg text-gray-400 mb-12">Get in touch with our team</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Card className="bg-primary-medium/50 backdrop-blur-sm border-accent-blue/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                  <CardDescription>Reach out to us through any of these channels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent-blue/20 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-accent-blue" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Email</div>
                      <div>contact@securescanai.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-accent-blue/20 p-2 rounded-full">
                      <Phone className="h-5 w-5 text-accent-blue" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Phone</div>
                      <div>+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-accent-blue/20 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-accent-blue" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Support</div>
                      <div>support@securescanai.com</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-primary-medium/50 backdrop-blur-sm border-accent-blue/20">
                <CardHeader>
                  <CardTitle className="text-xl">FAQ</CardTitle>
                  <CardDescription>Common questions about our service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">What technologies does SecureScan AI use?</h3>
                    <p className="text-gray-300 text-sm">Our platform is built on the powerful open-source Zed Attack Proxy (ZAP) tool, enhanced with proprietary AI technology.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">How long does a typical scan take?</h3>
                    <p className="text-gray-300 text-sm">Scan duration depends on the size and complexity of your application. Quick scans take minutes, while comprehensive scans may take hours.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Is your service safe to use on production websites?</h3>
                    <p className="text-gray-300 text-sm">Yes, our scans are designed to be non-intrusive. However, we recommend testing on staging environments first for business-critical applications.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="bg-primary-medium/50 backdrop-blur-sm border-accent-blue/20">
                <CardHeader>
                  <CardTitle className="text-xl">Send Us a Message</CardTitle>
                  <CardDescription>We'll get back to you as soon as possible</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm">Name</label>
                        <Input 
                          id="name"
                          placeholder="Your name"
                          required
                          className="bg-primary-dark/40 border-accent-blue/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm">Email</label>
                        <Input 
                          id="email"
                          type="email"
                          placeholder="Your email"
                          required
                          className="bg-primary-dark/40 border-accent-blue/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm">Company (Optional)</label>
                      <Input 
                        id="company"
                        placeholder="Your company"
                        className="bg-primary-dark/40 border-accent-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm">Subject</label>
                      <Input 
                        id="subject"
                        placeholder="How can we help?"
                        required
                        className="bg-primary-dark/40 border-accent-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm">Message</label>
                      <Textarea 
                        id="message"
                        placeholder="Your message"
                        required
                        rows={5}
                        className="bg-primary-dark/40 border-accent-blue/20 resize-none"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold w-full"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-primary-medium/30 border-t border-accent-blue/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-400">
            <Link href="/terms-of-service" className="hover:text-accent-blue transition-colors">Terms of Service</Link>
            <div className="hidden md:block">•</div>
            <Link href="/privacy-policy" className="hover:text-accent-blue transition-colors">Privacy Policy</Link>
            <div className="hidden md:block">•</div>
            <Link href="/blog" className="hover:text-accent-blue transition-colors">Blog</Link>
            <div className="hidden md:block">•</div>
            <Link href="/contact" className="hover:text-accent-blue transition-colors">Contact</Link>
          </div>
          <div className="text-center mt-4 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SecureScan AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;