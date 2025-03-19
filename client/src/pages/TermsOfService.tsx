import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import GridBackground from '../components/GridBackground';

const TermsOfService: React.FC = () => {
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using the SecureScan AI service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Service Description</h2>
              <p>SecureScan AI provides web application security scanning services. Our platform helps identify potential security vulnerabilities in your web applications using AI-enhanced techniques built on ZAP technology.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. User Responsibilities</h2>
              <p>You agree to use our service only for lawful purposes and in accordance with these Terms. You must only scan websites that you own or have permission to test. Unauthorized security testing is illegal in many jurisdictions and violates our terms.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Data Privacy</h2>
              <p>We respect your privacy and handle your data in accordance with our Privacy Policy. By using our service, you consent to the collection and use of information as described in our Privacy Policy.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Limitations of Liability</h2>
              <p>While we strive to provide thorough and accurate security scans, we cannot guarantee that our service will identify all security vulnerabilities. Our service is provided "as is" without warranties of any kind.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to our website. Your continued use of the service after any changes constitutes acceptance of the new Terms.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Termination</h2>
              <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of our service, us, or third parties, or for any other reason.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at support@securescanai.com.</p>
            </section>
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

export default TermsOfService;