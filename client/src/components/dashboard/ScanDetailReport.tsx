import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Download, 
  ExternalLink, 
  Info, 
  Copy, 
  FileText, 
  Clock, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

// Mock scan data - in a real app this would come from an API or props
const scanDetails = {
  id: 1,
  url: 'https://example.com',
  scanDate: '2023-08-15',
  completedDate: '2023-08-15',
  status: 'completed',
  scanDuration: '1h 23m',
  pagesScanned: 53,
  requestsSent: 1246,
  vulnerabilities: {
    total: 12,
    high: 3,
    medium: 4,
    low: 5
  }
};

// Mock vulnerability data
const vulnerabilityData = [
  {
    id: 1,
    title: 'Cross-Site Scripting (XSS)',
    description: 'The application includes unvalidated user input in the HTML output without proper encoding, allowing attackers to inject malicious scripts.',
    severity: 'high',
    location: '/search?q=<script>alert("XSS")</script>',
    evidence: '<script>alert("XSS")</script> was injected into the search parameter',
    remediation: 'Implement context-sensitive encoding for all user-supplied data in the HTML output. Use React\'s built-in XSS protection or DOMPurify library.',
    cweid: 79,
    references: [
      'https://owasp.org/www-community/attacks/xss/',
      'https://portswigger.net/web-security/cross-site-scripting'
    ]
  },
  {
    id: 2,
    title: 'SQL Injection',
    description: 'The application constructs SQL statements using string concatenation with user-supplied input, allowing attackers to modify the query structure.',
    severity: 'high',
    location: '/products?id=1\' OR \'1\'=\'1',
    evidence: 'The parameter "id=1\' OR \'1\'=\'1" returned different results than "id=1"',
    remediation: 'Use parameterized queries or prepared statements for all database operations. Never directly embed user input into SQL queries.',
    cweid: 89,
    references: [
      'https://owasp.org/www-community/attacks/SQL_Injection',
      'https://portswigger.net/web-security/sql-injection'
    ]
  },
  {
    id: 3,
    title: 'Cross-Site Request Forgery (CSRF)',
    description: 'The application processes requests without verifying they originated from an authenticated user, allowing attackers to trick users into making unwanted actions.',
    severity: 'medium',
    location: '/api/user/update',
    evidence: 'Form submission endpoint lacks CSRF token validation',
    remediation: 'Implement CSRF tokens for all state-changing requests. Verify the token on the server side before processing the request.',
    cweid: 352,
    references: [
      'https://owasp.org/www-community/attacks/csrf',
      'https://portswigger.net/web-security/csrf'
    ]
  },
  {
    id: 4,
    title: 'Insecure Cookie Attributes',
    description: 'Cookies are set without secure attributes, potentially exposing sensitive data to attackers.',
    severity: 'medium',
    location: 'Response headers from /login',
    evidence: 'Set-Cookie: session=abc123; Path=/',
    remediation: 'Set the Secure, HttpOnly, and SameSite attributes on all sensitive cookies. The Secure attribute ensures cookies are only sent over HTTPS.',
    cweid: 614,
    references: [
      'https://owasp.org/www-community/controls/SecureCookieAttribute',
      'https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies'
    ]
  },
  {
    id: 5,
    title: 'Missing Content Security Policy',
    description: 'The application does not implement a Content Security Policy, allowing execution of potentially harmful scripts from any source.',
    severity: 'medium',
    location: 'Response headers from /',
    evidence: 'No Content-Security-Policy header found in response',
    remediation: 'Implement a Content Security Policy header that restricts script sources to trusted domains and prevents inline script execution.',
    cweid: 693,
    references: [
      'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
      'https://owasp.org/www-project-secure-headers/#content-security-policy'
    ]
  },
  {
    id: 6,
    title: 'Server Information Disclosure',
    description: 'The server reveals detailed version information, which could help attackers identify specific vulnerabilities.',
    severity: 'low',
    location: 'Response headers from /',
    evidence: 'Server: Apache/2.4.41 (Ubuntu)',
    remediation: 'Configure the web server to remove or obscure version information from HTTP response headers.',
    cweid: 200,
    references: [
      'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/02-Fingerprint_Web_Server'
    ]
  },
  {
    id: 7,
    title: 'Insecure SOP Implementation',
    description: 'The application\'s Same-Origin Policy implementation allows cross-origin requests that should be restricted.',
    severity: 'low',
    location: 'Response headers from /api/data',
    evidence: 'Access-Control-Allow-Origin: *',
    remediation: 'Restrict CORS headers to only allow specific trusted domains. Avoid using wildcard origins, especially for endpoints that handle sensitive data.',
    cweid: 346,
    references: [
      'https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy',
      'https://owasp.org/www-project-secure-headers/#access-control-allow-origin'
    ]
  }
];

interface ScanDetailReportProps {
  scanId: number;
  onBack: () => void;
}

const ScanDetailReport: React.FC<ScanDetailReportProps> = ({ scanId, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedVulnerability, setExpandedVulnerability] = useState<number | null>(null);
  
  const handleCopyLink = () => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(`https://codesafe.ai/reports/${scanId}`);
    toast({
      title: "Link copied",
      description: "The report link has been copied to your clipboard",
    });
  };
  
  const handleDownloadReport = () => {
    // In a real app, this would trigger the download of a PDF or JSON report
    toast({
      title: "Report download started",
      description: "Your report will be downloaded shortly",
    });
  };
  
  const toggleVulnerability = (id: number) => {
    if (expandedVulnerability === id) {
      setExpandedVulnerability(null);
    } else {
      setExpandedVulnerability(id);
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    }
  };
  
  const filterVulnerabilities = (tab: string) => {
    if (tab === 'all') return vulnerabilityData;
    return vulnerabilityData.filter(vuln => vuln.severity === tab);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex flex-col space-y-3">
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-white w-fit -ml-2 mb-1"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Scan Manager
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              Scan Report: {scanDetails.url}
              <Badge 
                className="ml-4 bg-green-500/20 text-green-500 border border-green-500/30"
              >
                Completed
              </Badge>
            </h1>
            <p className="text-gray-400 mt-1">
              Scanned on {scanDetails.scanDate} • Duration: {scanDetails.scanDuration}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10"
              onClick={handleCopyLink}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button 
              className="bg-accent-blue hover:bg-accent-blue/90 text-white"
              onClick={handleDownloadReport}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-primary-medium/30 border border-accent-blue/20 p-1">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            All Vulnerabilities
          </TabsTrigger>
          <TabsTrigger 
            value="high" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            High
          </TabsTrigger>
          <TabsTrigger 
            value="medium" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Medium
          </TabsTrigger>
          <TabsTrigger 
            value="low" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Low
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-primary-medium/30 border-accent-blue/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Vulnerabilities</p>
                    <h2 className="text-2xl font-bold">{scanDetails.vulnerabilities.total}</h2>
                  </div>
                  <Shield className="h-8 w-8 text-accent-blue opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-medium/30 border-accent-blue/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Pages Scanned</p>
                    <h2 className="text-2xl font-bold">{scanDetails.pagesScanned}</h2>
                  </div>
                  <FileText className="h-8 w-8 text-accent-blue opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-medium/30 border-accent-blue/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Scan Duration</p>
                    <h2 className="text-2xl font-bold">{scanDetails.scanDuration}</h2>
                  </div>
                  <Clock className="h-8 w-8 text-accent-blue opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-medium/30 border-accent-blue/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Scan Date</p>
                    <h2 className="text-2xl font-bold">{scanDetails.scanDate}</h2>
                  </div>
                  <Calendar className="h-8 w-8 text-accent-blue opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Vulnerability Distribution Card */}
          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader>
              <CardTitle>Vulnerability Severity Distribution</CardTitle>
              <CardDescription>Breakdown of vulnerabilities by severity level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span>High Severity</span>
                    </div>
                    <span className="text-red-500 font-medium">{scanDetails.vulnerabilities.high}</span>
                  </div>
                  <Progress 
                    value={(scanDetails.vulnerabilities.high / scanDetails.vulnerabilities.total) * 100} 
                    className="h-2 bg-primary-dark"
                    indicatorClassName="bg-red-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                      <span>Medium Severity</span>
                    </div>
                    <span className="text-yellow-500 font-medium">{scanDetails.vulnerabilities.medium}</span>
                  </div>
                  <Progress 
                    value={(scanDetails.vulnerabilities.medium / scanDetails.vulnerabilities.total) * 100} 
                    className="h-2 bg-primary-dark"
                    indicatorClassName="bg-yellow-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 text-blue-500 mr-2" />
                      <span>Low Severity</span>
                    </div>
                    <span className="text-blue-500 font-medium">{scanDetails.vulnerabilities.low}</span>
                  </div>
                  <Progress 
                    value={(scanDetails.vulnerabilities.low / scanDetails.vulnerabilities.total) * 100} 
                    className="h-2 bg-primary-dark"
                    indicatorClassName="bg-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Top Vulnerabilities Card */}
          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader>
              <CardTitle>Critical Vulnerabilities</CardTitle>
              <CardDescription>Highest priority security issues that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vulnerabilityData
                  .filter(vuln => vuln.severity === 'high')
                  .slice(0, 3)
                  .map(vuln => (
                    <div key={vuln.id} className="p-4 bg-primary-dark/40 rounded-lg border border-red-500/20">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-medium">{vuln.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{vuln.description}</p>
                          </div>
                        </div>
                        <Badge className="bg-red-500/20 text-red-500 border border-red-500/30">
                          High
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
              
              <Button
                variant="outline"
                className="w-full mt-4 border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10"
                onClick={() => setActiveTab('high')}
              >
                View All High Severity Issues
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Vulnerability Tabs Content (All, High, Medium, Low) */}
        {['all', 'high', 'medium', 'low'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            <Card className="bg-primary-medium/30 border-accent-blue/20">
              <CardHeader>
                <CardTitle>
                  {tab === 'all' 
                    ? 'All Vulnerabilities' 
                    : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Severity Vulnerabilities`}
                </CardTitle>
                <CardDescription>
                  {tab === 'all'
                    ? `${vulnerabilityData.length} vulnerabilities detected in this scan`
                    : `${filterVulnerabilities(tab).length} ${tab} severity vulnerabilities detected`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterVulnerabilities(tab).map((vuln) => (
                    <div 
                      key={vuln.id} 
                      className={`p-4 bg-primary-dark/40 rounded-lg border ${
                        expandedVulnerability === vuln.id 
                          ? 'border-accent-blue/40' 
                          : 'border-accent-blue/10'
                      }`}
                    >
                      <div 
                        className="flex justify-between items-start cursor-pointer"
                        onClick={() => toggleVulnerability(vuln.id)}
                      >
                        <div className="flex items-start">
                          {vuln.severity === 'high' && <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-1 flex-shrink-0" />}
                          {vuln.severity === 'medium' && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-1 flex-shrink-0" />}
                          {vuln.severity === 'low' && <Info className="h-5 w-5 text-blue-500 mr-2 mt-1 flex-shrink-0" />}
                          <div>
                            <h3 className="text-lg font-medium">{vuln.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{vuln.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge className={`mr-3 ${getSeverityColor(vuln.severity)}`}>
                            {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                          </Badge>
                          {expandedVulnerability === vuln.id 
                            ? <ChevronUp className="h-5 w-5 text-gray-400" /> 
                            : <ChevronDown className="h-5 w-5 text-gray-400" />
                          }
                        </div>
                      </div>
                      
                      {expandedVulnerability === vuln.id && (
                        <div className="mt-4 pt-4 border-t border-accent-blue/10 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Location</h4>
                            <div className="mt-1 p-2 bg-primary-dark rounded-md text-gray-300 font-mono text-sm">
                              {vuln.location}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Evidence</h4>
                            <div className="mt-1 p-2 bg-primary-dark rounded-md text-gray-300 font-mono text-sm">
                              {vuln.evidence}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Remediation</h4>
                            <p className="mt-1 text-gray-300 text-sm">{vuln.remediation}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">References</h4>
                            <ul className="mt-1 space-y-1">
                              {vuln.references.map((ref, index) => (
                                <li key={index}>
                                  <a 
                                    href={ref} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-accent-blue hover:text-accent-blue-light text-sm flex items-center"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    {ref.replace(/^https?:\/\//, '').split('/')[0]}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="text-xs">
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ScanDetailReport; 