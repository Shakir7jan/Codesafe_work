import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import GridBackground from '../components/GridBackground';

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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Blog</h1>
          <p className="text-lg text-gray-400 mb-12">Latest insights on web application security</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="bg-primary-medium/50 backdrop-blur-sm border-accent-blue/20 hover:border-accent-blue/40 hover:shadow-lg hover:shadow-accent-blue/10 transition-all">
                <CardHeader>
                  <div className="text-sm text-accent-blue mb-1">{post.category}</div>
                  <CardTitle className="text-xl font-semibold line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-400 gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                    <span className="text-gray-500">•</span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-accent-blue hover:text-accent-blue/80 p-0 flex items-center gap-1">
                    Read more <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
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

export default Blog;