import React from 'react';
import { Link } from 'wouter';
import { 
  Search, 
  BarChart3, 
  AlertTriangle, 
  Shield, 
  Clock, 
  CheckCircle,
  XCircle,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Define interfaces for our data types
interface DashboardStats {
  totalScans: number;
  activeScans: number;
  completedScans: number;
  failedScans: number;
  totalVulnerabilities: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
}

interface BaseScan {
  id: number;
  url: string;
  date: string;
  status: 'completed' | 'active' | 'failed';
}

interface CompletedScan extends BaseScan {
  status: 'completed';
  vulnerabilities: number;
  highSeverity?: number;
  mediumSeverity?: number;
  lowSeverity?: number;
}

interface ActiveScan extends BaseScan {
  status: 'active';
  progress: number;
}

interface FailedScan extends BaseScan {
  status: 'failed';
  error: string;
}

type Scan = CompletedScan | ActiveScan | FailedScan;

// Mock data for the dashboard overview
const mockStats: DashboardStats = {
  totalScans: 12,
  activeScans: 1,
  completedScans: 9,
  failedScans: 2,
  totalVulnerabilities: 28,
  highSeverity: 4,
  mediumSeverity: 9,
  lowSeverity: 15,
};

// Mock recent scans data
const recentScans: Scan[] = [
  {
    id: 1,
    url: 'https://example.com',
    status: 'completed',
    date: '2025-02-28',
    vulnerabilities: 5,
    highSeverity: 1,
    mediumSeverity: 2,
    lowSeverity: 2,
  },
  {
    id: 2,
    url: 'https://dashboard.example.org',
    status: 'active',
    date: '2025-03-01',
    progress: 68,
  },
  {
    id: 3,
    url: 'https://store.example.io',
    status: 'failed',
    date: '2025-02-25',
    error: 'Connection timeout',
  },
  {
    id: 4,
    url: 'https://blog.example.net',
    status: 'completed',
    date: '2025-02-22',
    vulnerabilities: 2,
    highSeverity: 0,
    mediumSeverity: 1,
    lowSeverity: 1,
  },
];

const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400">Overview of your security scans and vulnerabilities</p>
        </div>
        <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
          <Search className="mr-2 h-4 w-4" />
          New Scan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-accent-blue" />
              Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.totalScans}</div>
            <div className="text-xs text-gray-400 mt-1">Total scans conducted</div>
            <div className="flex mt-4 justify-between text-sm">
              <div className="flex flex-col items-center">
                <Clock className="h-4 w-4 text-yellow-500 mb-1" />
                <span className="font-medium">{mockStats.activeScans}</span>
                <span className="text-xs text-gray-400">Active</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mb-1" />
                <span className="font-medium">{mockStats.completedScans}</span>
                <span className="text-xs text-gray-400">Completed</span>
              </div>
              <div className="flex flex-col items-center">
                <XCircle className="h-4 w-4 text-red-500 mb-1" />
                <span className="font-medium">{mockStats.failedScans}</span>
                <span className="text-xs text-gray-400">Failed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent-blue" />
              Vulnerabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.totalVulnerabilities}</div>
            <div className="text-xs text-gray-400 mt-1">Total vulnerabilities found</div>
            <div className="flex mt-4 justify-between text-sm">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mb-1"></div>
                <span className="font-medium">{mockStats.highSeverity}</span>
                <span className="text-xs text-gray-400">High</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mb-1"></div>
                <span className="font-medium">{mockStats.mediumSeverity}</span>
                <span className="text-xs text-gray-400">Medium</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mb-1"></div>
                <span className="font-medium">{mockStats.lowSeverity}</span>
                <span className="text-xs text-gray-400">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent-blue" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">76/100</div>
            <div className="text-xs text-gray-400 mt-1">Overall security rating</div>
            <div className="mt-4">
              <div className="flex justify-between mb-1 text-xs">
                <span>Current score</span>
                <span className="text-green-400">+12 since last scan</span>
              </div>
              <Progress value={76} className="h-2 bg-gray-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent-blue" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">9</div>
            <div className="text-xs text-gray-400 mt-1">Generated reports</div>
            <div className="mt-4">
              <Link href="/dashboard/reports">
                <Button variant="outline" size="sm" className="w-full border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                  View All Reports
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Scans</h2>
          <Link href="/dashboard/scans">
            <Button variant="ghost" size="sm" className="text-accent-blue hover:text-accent-blue/80">
              View All 
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-accent-blue/20 text-left text-sm text-gray-400">
                <th className="py-3 px-4">URL</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Vulnerabilities</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.map((scan) => (
                <tr key={scan.id} className="border-b border-accent-blue/10 hover:bg-primary-medium/20">
                  <td className="py-3 px-4 text-sm">
                    <div className="font-medium">{scan.url}</div>
                  </td>
                  <td className="py-3 px-4">
                    {scan.status === 'completed' && (
                      <div className="flex items-center text-green-500 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" /> Completed
                      </div>
                    )}
                    {scan.status === 'active' && (
                      <div className="space-y-1">
                        <div className="flex items-center text-yellow-500 text-sm">
                          <Clock className="h-4 w-4 mr-1" /> In Progress
                        </div>
                        <Progress value={scan.progress} className="h-1.5 w-32 bg-gray-700" />
                      </div>
                    )}
                    {scan.status === 'failed' && (
                      <div className="flex items-center text-red-500 text-sm">
                        <XCircle className="h-4 w-4 mr-1" /> Failed
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">{scan.date}</td>
                  <td className="py-3 px-4">
                    {scan.status === 'completed' ? (
                      <div className="flex items-center space-x-3 text-sm">
                        <span>{scan.vulnerabilities} total</span>
                        <div className="flex space-x-1">
                          {scan.status === 'completed' && scan.highSeverity && scan.highSeverity > 0 && (
                            <div className="flex items-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1"></div>
                              <span>{scan.highSeverity}</span>
                            </div>
                          )}
                          {scan.status === 'completed' && scan.mediumSeverity && scan.mediumSeverity > 0 && (
                            <div className="flex items-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-1"></div>
                              <span>{scan.mediumSeverity}</span>
                            </div>
                          )}
                          {scan.status === 'completed' && scan.lowSeverity && scan.lowSeverity > 0 && (
                            <div className="flex items-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-1"></div>
                              <span>{scan.lowSeverity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : scan.status === 'active' ? (
                      <span className="text-sm text-gray-400">Scanning...</span>
                    ) : (
                      <span className="text-sm text-gray-400">{scan.error}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {scan.status === 'completed' && (
                        <Button variant="outline" size="sm" className="h-8 text-xs border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                          View Report
                        </Button>
                      )}
                      {scan.status === 'active' && (
                        <Button variant="outline" size="sm" className="h-8 text-xs border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10">
                          Cancel
                        </Button>
                      )}
                      {scan.status === 'failed' && (
                        <Button variant="outline" size="sm" className="h-8 text-xs border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                          Retry
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Security Tips */}
      <Card className="bg-gradient-to-r from-primary-medium/50 to-accent-blue/20 border-accent-blue/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="bg-accent-blue/20 p-3 rounded-full">
                <Shield className="h-8 w-8 text-accent-blue" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">AI Security Tip</h3>
              <p className="text-gray-300">
                Cross-site scripting (XSS) remains one of the most common vulnerabilities in web applications.
                Always validate and sanitize user input, especially in AI-generated applications where default
                templates may not include proper escaping.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button variant="outline" className="border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;