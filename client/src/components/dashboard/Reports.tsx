import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Share2, 
  Filter,
  Search,
  AlertTriangle,
  Calendar,
  Cpu,
  Shield,
  Lightbulb,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock reports data
const mockReports = [
  {
    id: 1,
    url: 'https://example.com',
    scanDate: '2025-02-28',
    vulnerabilities: {
      total: 5,
      high: 1,
      medium: 2,
      low: 2
    },
    scanDuration: '1h 23m',
    pagesScanned: 53
  },
  {
    id: 2,
    url: 'https://blog.example.net',
    scanDate: '2025-02-22',
    vulnerabilities: {
      total: 2,
      high: 0,
      medium: 1,
      low: 1
    },
    scanDuration: '47m',
    pagesScanned: 24
  },
  {
    id: 3,
    url: 'https://admin.example.org',
    scanDate: '2025-02-15',
    vulnerabilities: {
      total: 9,
      high: 3,
      medium: 4,
      low: 2
    },
    scanDuration: '2h 12m',
    pagesScanned: 76
  },
  {
    id: 4,
    url: 'https://api.example.io',
    scanDate: '2025-02-10',
    vulnerabilities: {
      total: 3,
      high: 0,
      medium: 2,
      low: 1
    },
    scanDuration: '52m',
    pagesScanned: 17
  }
];

// Mock vulnerability details for expanded report
const mockVulnerabilityDetails = {
  xss: {
    title: 'Cross-Site Scripting (XSS)',
    description: 'The application includes unvalidated user input in the HTML output without proper encoding, allowing attackers to inject malicious scripts.',
    severity: 'High',
    evidence: '<script>alert("XSS")</script> was injected into the search parameter',
    location: '/search?q=<script>alert("XSS")</script>',
    remediation: 'Implement context-sensitive encoding for all user-supplied data in the HTML output. Use React\'s built-in XSS protection or DOMPurify library.'
  },
  sqli: {
    title: 'SQL Injection',
    description: 'The application constructs SQL statements using string concatenation with user-supplied input, allowing attackers to modify the query structure.',
    severity: 'High',
    evidence: 'The parameter "id=1\' OR \'1\'=\'1" returned different results than "id=1"',
    location: '/products?id=1\' OR \'1\'=\'1',
    remediation: 'Use parameterized queries or prepared statements for all database operations. Never directly embed user input into SQL queries.'
  },
  csrf: {
    title: 'Cross-Site Request Forgery (CSRF)',
    description: 'The application processes requests without verifying they originated from an authenticated user, allowing attackers to trick users into making unwanted actions.',
    severity: 'Medium',
    evidence: 'Form submission endpoint lacks CSRF token validation',
    location: '/api/user/update',
    remediation: 'Implement CSRF tokens for all state-changing requests. Verify the token on the server side before processing the request.'
  }
};

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  
  // Filter reports based on active tab
  const filteredReports = mockReports.filter(() => {
    // In a real app, we'd implement actual filtering logic here
    return true;
  });

  const handleViewReport = (reportId: number) => {
    setSelectedReport(reportId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
          <p className="text-gray-400">View and manage your security scan reports</p>
        </div>
      </div>

      {selectedReport === null ? (
        <>
          {/* Search and Filter */}
          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardContent className="p-4 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search reports..." 
                  className="pl-9 bg-primary-dark border-accent-blue/30 text-gray-100"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-accent-blue/30 text-gray-300 min-w-[120px]">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-primary-medium border-accent-blue/30 text-gray-100">
                  <DropdownMenuItem className="hover:bg-primary-dark/50">Date (Newest)</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary-dark/50">Date (Oldest)</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary-dark/50">Vulnerabilities (High to Low)</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary-dark/50">Vulnerabilities (Low to High)</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary-dark/50">Alphabetical (A-Z)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          {/* Report Tabs and List */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-primary-medium/30 border border-accent-blue/20 p-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
              >
                All Reports
              </TabsTrigger>
              <TabsTrigger 
                value="high" 
                className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
              >
                High Severity
              </TabsTrigger>
              <TabsTrigger 
                value="medium" 
                className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
              >
                Medium Severity
              </TabsTrigger>
              <TabsTrigger 
                value="low" 
                className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
              >
                Low Severity
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReports.map((report) => (
                  <Card 
                    key={report.id} 
                    className="bg-primary-medium/30 border-accent-blue/20 hover:border-accent-blue/40 transition-colors cursor-pointer"
                    onClick={() => handleViewReport(report.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-medium">{report.url}</h3>
                          <div className="text-sm text-gray-400 mt-1">
                            Scanned on {report.scanDate}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-primary-dark/30 rounded-lg p-2 text-center">
                          <div className="text-sm text-gray-400">High</div>
                          <div className="text-lg font-bold text-red-500">{report.vulnerabilities.high}</div>
                        </div>
                        <div className="bg-primary-dark/30 rounded-lg p-2 text-center">
                          <div className="text-sm text-gray-400">Medium</div>
                          <div className="text-lg font-bold text-yellow-500">{report.vulnerabilities.medium}</div>
                        </div>
                        <div className="bg-primary-dark/30 rounded-lg p-2 text-center">
                          <div className="text-sm text-gray-400">Low</div>
                          <div className="text-lg font-bold text-blue-500">{report.vulnerabilities.low}</div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm text-gray-400">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>{report.pagesScanned} pages scanned</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Duration: {report.scanDuration}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-4 bg-accent-blue hover:bg-accent-blue/90 text-white"
                        onClick={() => handleViewReport(report.id)}
                      >
                        View Full Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        // Detailed report view
        <div className="space-y-6">
          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-accent-blue mb-4 md:mb-0 self-start"
                  onClick={() => setSelectedReport(null)}
                >
                  ← Back to Reports
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" className="border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Report Header */}
              <div className="border-b border-accent-blue/20 pb-4 mt-2">
                <h2 className="text-2xl font-bold">Security Report for {mockReports.find(r => r.id === selectedReport)?.url}</h2>
                <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-400 mt-2 gap-y-1 gap-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Scan Date: {mockReports.find(r => r.id === selectedReport)?.scanDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Duration: {mockReports.find(r => r.id === selectedReport)?.scanDuration}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>{mockReports.find(r => r.id === selectedReport)?.pagesScanned} pages scanned</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <Card className="bg-primary-dark/30 border-accent-blue/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Security Score</div>
                        <div className="text-2xl font-bold mt-1">68/100</div>
                      </div>
                      <div className="bg-accent-blue/20 rounded-full p-2">
                        <Shield className="h-6 w-6 text-accent-blue" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary-dark/30 border-accent-blue/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Total Vulnerabilities</div>
                        <div className="text-2xl font-bold mt-1">
                          {mockReports.find(r => r.id === selectedReport)?.vulnerabilities.total}
                        </div>
                      </div>
                      <div className="bg-accent-blue/20 rounded-full p-2">
                        <AlertTriangle className="h-6 w-6 text-accent-blue" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary-dark/30 border-accent-blue/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Technologies Detected</div>
                        <div className="text-2xl font-bold mt-1">7</div>
                      </div>
                      <div className="bg-accent-blue/20 rounded-full p-2">
                        <Cpu className="h-6 w-6 text-accent-blue" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vulnerabilities Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Vulnerabilities</h3>
                
                {/* XSS Vulnerability */}
                <Card className="mb-4 bg-primary-dark/30 border-l-4 border-l-red-500 border-t-accent-blue/20 border-r-accent-blue/20 border-b-accent-blue/20">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                      <div className="md:w-72 flex-shrink-0">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                          <span className="font-medium text-red-400">High Severity</span>
                        </div>
                        <h4 className="text-lg font-medium mt-1">{mockVulnerabilityDetails.xss.title}</h4>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-gray-300">
                          {mockVulnerabilityDetails.xss.description}
                        </p>
                        
                        <div className="mt-4 space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-400">Location</div>
                            <div className="mt-1 text-sm bg-primary-medium/50 p-2 rounded font-mono">
                              {mockVulnerabilityDetails.xss.location}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-gray-400">Evidence</div>
                            <div className="mt-1 text-sm bg-primary-medium/50 p-2 rounded font-mono">
                              {mockVulnerabilityDetails.xss.evidence}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="bg-accent-blue/20 rounded-full p-2 mr-3">
                          <Lightbulb className="h-5 w-5 text-accent-blue" />
                        </div>
                        <div>
                          <div className="font-medium text-accent-blue">AI Recommended Solution</div>
                          <p className="text-gray-300 mt-1">
                            {mockVulnerabilityDetails.xss.remediation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* SQL Injection Vulnerability */}
                <Card className="mb-4 bg-primary-dark/30 border-l-4 border-l-red-500 border-t-accent-blue/20 border-r-accent-blue/20 border-b-accent-blue/20">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                      <div className="md:w-72 flex-shrink-0">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                          <span className="font-medium text-red-400">High Severity</span>
                        </div>
                        <h4 className="text-lg font-medium mt-1">{mockVulnerabilityDetails.sqli.title}</h4>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-gray-300">
                          {mockVulnerabilityDetails.sqli.description}
                        </p>
                        
                        <div className="mt-4 space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-400">Location</div>
                            <div className="mt-1 text-sm bg-primary-medium/50 p-2 rounded font-mono">
                              {mockVulnerabilityDetails.sqli.location}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-gray-400">Evidence</div>
                            <div className="mt-1 text-sm bg-primary-medium/50 p-2 rounded font-mono">
                              {mockVulnerabilityDetails.sqli.evidence}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="bg-accent-blue/20 rounded-full p-2 mr-3">
                          <Lightbulb className="h-5 w-5 text-accent-blue" />
                        </div>
                        <div>
                          <div className="font-medium text-accent-blue">AI Recommended Solution</div>
                          <p className="text-gray-300 mt-1">
                            {mockVulnerabilityDetails.sqli.remediation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* CSRF Vulnerability */}
                <Card className="mb-4 bg-primary-dark/30 border-l-4 border-l-yellow-500 border-t-accent-blue/20 border-r-accent-blue/20 border-b-accent-blue/20">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                      <div className="md:w-72 flex-shrink-0">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                          <span className="font-medium text-yellow-400">Medium Severity</span>
                        </div>
                        <h4 className="text-lg font-medium mt-1">{mockVulnerabilityDetails.csrf.title}</h4>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-gray-300">
                          {mockVulnerabilityDetails.csrf.description}
                        </p>
                        
                        <div className="mt-4 space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-400">Location</div>
                            <div className="mt-1 text-sm bg-primary-medium/50 p-2 rounded font-mono">
                              {mockVulnerabilityDetails.csrf.location}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-gray-400">Evidence</div>
                            <div className="mt-1 text-sm bg-primary-medium/50 p-2 rounded font-mono">
                              {mockVulnerabilityDetails.csrf.evidence}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="bg-accent-blue/20 rounded-full p-2 mr-3">
                          <Lightbulb className="h-5 w-5 text-accent-blue" />
                        </div>
                        <div>
                          <div className="font-medium text-accent-blue">AI Recommended Solution</div>
                          <p className="text-gray-300 mt-1">
                            {mockVulnerabilityDetails.csrf.remediation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;