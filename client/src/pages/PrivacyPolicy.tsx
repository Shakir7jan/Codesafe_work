import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import GridBackground from '../components/GridBackground';

const PrivacyPolicy: React.FC = () => {
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
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, subscribe to our service, or contact us for support. This may include your name, email address, company name, and website URLs for scanning.</p>
              <p className="mt-2">When you use our service, we automatically collect certain information about your device and usage patterns, including IP address, browser type, operating system, and the pages you visit on our site.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, including:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Processing and completing security scans</li>
                <li>Sending you technical notices and security alerts</li>
                <li>Responding to your comments and questions</li>
                <li>Providing customer service and technical support</li>
                <li>Monitoring and analyzing trends and usage to improve our service</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
              <p>We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Sharing of Information</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this Privacy Policy. We may share your information with trusted third parties who assist us in operating our website and providing our services.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar technologies to track activity on our service and collect certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights and Choices</h2>
              <p>You may update, correct, or delete your account information at any time by logging into your account. You may also opt out of receiving promotional communications from us by following the instructions in those communications.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Changes to This Privacy Policy</h2>
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this page.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@securescanai.com.</p>
            </section>
            
            <div className="text-sm text-gray-400 mt-8">
              Last Updated: March 19, 2025
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

export default PrivacyPolicy;