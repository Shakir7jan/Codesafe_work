import React from 'react';
import { Link } from 'wouter';
import { Calendar, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import GridBackground from '../components/GridBackground';
import { Helmet } from 'react-helmet';

const blogPosts = [
  {
    id: 1,
    title: 'Understanding OWASP Top 10 Vulnerabilities in AI-Generated Code',
    excerpt: 'Explore how AI-generated code can introduce unique security vulnerabilities and how to address them.',
    date: 'March 15, 2025',
    author: 'Alex Chen',
    readTime: '8 min read',
    category: 'Security Research'
  },
  {
    id: 2,
    title: 'The Rise of "Vibe-Coded" Applications and Security Implications',
    excerpt: 'An analysis of security challenges posed by applications built by non-developers using AI assistance.',
    date: 'March 10, 2025',
    author: 'Maria Rodriguez',
    readTime: '6 min read',
    category: 'Trends'
  },
  {
    id: 3,
    title: 'Advanced ZAP Techniques for Modern Web Applications',
    excerpt: 'Learn how our platform leverages ZAP technology to detect vulnerabilities in modern JavaScript frameworks.',
    date: 'March 5, 2025',
    author: 'James Wilson',
    readTime: '10 min read',
    category: 'Technical'
  },
  {
    id: 4,
    title: 'Security Best Practices for Web3 Applications',
    excerpt: 'Exploring the unique security challenges of decentralized applications and how to address them.',
    date: 'February 28, 2025',
    author: 'Sarah Kim',
    readTime: '7 min read',
    category: 'Web3'
  },
  {
    id: 5,
    title: 'Why Regular Security Audits Matter: Real-World Case Studies',
    excerpt: 'Examining security breaches that could have been prevented with regular vulnerability scanning.',
    date: 'February 20, 2025',
    author: 'David Thompson',
    readTime: '9 min read',
    category: 'Case Studies'
  },
  {
    id: 6,
    title: 'Introducing SecureScan AI: The Future of Web Application Security',
    excerpt: 'Our journey in building an AI-enhanced security platform that makes vulnerability detection accessible to everyone.',
    date: 'February 15, 2025',
    author: 'Emily Johnson',
    readTime: '5 min read',
    category: 'Company News'
  },
];

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-dark text-gray-100 font-sans antialiased">
      <Helmet>
        <title>Blog | SecureScan AI - Web Application Security</title>
        <meta name="description" content="Latest insights and articles on web application security, AI-enhanced security scanning, and vulnerability detection from SecureScan AI." />
        <meta name="keywords" content="web security, application security, security blog, OWASP, vulnerability scanning, security best practices" />
        <meta property="og:title" content="Security Blog | SecureScan AI" />
        <meta property="og:description" content="Latest insights and articles on web application security and vulnerability detection." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://securescanai.com/blog" />
        <link rel="canonical" href="https://securescanai.com/blog" />
      </Helmet>
      
      <GridBackground opacity={0.3} gridSize={30} showDots={true} />

      {/* Navbar */}
      <nav className="fixed w-full bg-primary-dark/90 backdrop-blur-md z-50 border-b border-accent-blue/20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Shield className="h-8 w-8 text-accent-blue relative z-10" />
                <div className="absolute inset-0 bg-accent-blue/20 rounded-full blur-md"></div>
              </div>
              <span className="text-xl font-bold tracking-tight">SecureScan<span className="blue-gradient-text">AI</span></span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-300 hover:text-accent-blue transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-gray-300 hover:text-accent-blue transition-colors">
              How it Works
            </Link>
            <Link href="/#pricing" className="text-gray-300 hover:text-accent-blue transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-accent-blue-light hover:text-accent-blue transition-colors">
              Blog
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant="outline" 
                className="border-accent-blue/60 text-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue-light transition-all blue-glow-border"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 pt-28 pb-16 relative">
        <div className="absolute top-0 left-0 right-0 h-96 bg-radial-gradient-accent-blue opacity-60 -z-10" />
        <div className="max-w-6xl mx-auto">
          <div className="relative blue-angled-border inline-block p-4 mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold blue-gradient-text">Blog</h1>
          </div>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl ml-2 blue-highlight-bar">Latest insights and research on web application security and vulnerability detection</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <Link href={`/blog/${post.id}`} key={post.id} className="block group">
                <Card className="bg-primary-medium/50 backdrop-blur-sm border-accent-blue/20 group-hover:border-accent-blue/40 group-hover:blue-glow-border transition-all duration-300 h-full relative overflow-hidden">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-l from-accent-blue to-transparent transform rotate-45 translate-y-6"></div>
                  </div>
                  
                  <CardHeader className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xs px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue-light border border-accent-blue/20 font-medium">
                        {post.category}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold line-clamp-2 group-hover:blue-gradient-text transition-all duration-300">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-400 gap-2">
                      <Calendar className="h-4 w-4 text-accent-blue" />
                      <span>{post.date}</span>
                      <span className="text-gray-500">•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t border-accent-blue/10 pt-4 mt-2">
                    <div className="text-accent-blue-light group-hover:text-accent-blue flex items-center gap-1 transition-all font-medium">
                      Read article <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-primary-medium/60 border-t border-accent-blue/30 py-8 relative">
        <div className="absolute inset-0 -z-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundSize: '30px 30px',
              backgroundImage: `
                linear-gradient(to right, var(--accent-blue)/5 1px, transparent 1px),
                linear-gradient(to bottom, var(--accent-blue)/5 1px, transparent 1px)
              `,
              opacity: 0.3
            }}
          />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-gray-400">
            <Link href="/terms-of-service" className="hover:text-accent-blue-light transition-colors hover:underline decoration-accent-blue/30 underline-offset-4">
              Terms of Service
            </Link>
            <div className="hidden md:block text-accent-blue/40">•</div>
            <Link href="/privacy-policy" className="hover:text-accent-blue-light transition-colors hover:underline decoration-accent-blue/30 underline-offset-4">
              Privacy Policy
            </Link>
            <div className="hidden md:block text-accent-blue/40">•</div>
            <Link href="/blog" className="text-accent-blue hover:text-accent-blue-light transition-colors">
              Blog
            </Link>
            <div className="hidden md:block text-accent-blue/40">•</div>
            <Link href="/contact" className="hover:text-accent-blue-light transition-colors hover:underline decoration-accent-blue/30 underline-offset-4">
              Contact
            </Link>
          </div>
          
          <div className="flex justify-center mt-6 mb-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent"></div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SecureScan<span className="text-accent-blue">AI</span>. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;