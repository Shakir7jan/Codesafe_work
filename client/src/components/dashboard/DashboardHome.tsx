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
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDashboardStats, useRecentScans, calculateSecurityScore } from '@/hooks/use-dashboard-data';
import { format } from 'date-fns';
import { TierBadge } from './Dashboard';

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
  subscription?: {
    tier: string;
  };
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
  subscription: {
    tier: 'Premium',
  },
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
  // Use our custom hooks to fetch real data
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats();
  const { data: recentScans, isLoading: isLoadingScans, error: scansError } = useRecentScans(5);
  
  // Calculate security score from real data
  const securityScore = stats ? calculateSecurityScore(stats) : 0;
  
  // Format date from ISO string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Helper to determine badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20';
      case 'completed':
        return 'bg-green-500/20 text-green-500 border border-green-500/20';
      case 'failed':
        return 'bg-red-500/20 text-red-500 border border-red-500/20';
      default:
        return 'bg-gray-500/20 text-gray-500 border border-gray-500/20';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          {/* Subscription Plan Badge */}
          {stats?.subscription?.tier && (
            <div className="flex justify-center my-2">
              <TierBadge tier={stats.subscription.tier} large />
            </div>
          )}
          <p className="text-gray-400">Overview of your security scans and vulnerabilities</p>
        </div>
        <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
          <Search className="mr-2 h-4 w-4" />
          New Scan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Scans Card */}
        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-accent-blue" />
              Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 text-accent-blue animate-spin" />
              </div>
            ) : statsError ? (
              <div className="text-red-400 text-sm">Error loading data</div>
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.totalScans || 0}</div>
                <div className="text-xs text-gray-400 mt-1">Total scans conducted</div>
                <div className="flex mt-4 justify-between text-sm">
                  <div className="flex flex-col items-center">
                    <Clock className="h-4 w-4 text-yellow-500 mb-1" />
                    <span className="font-medium">{stats?.activeScans || 0}</span>
                    <span className="text-xs text-gray-400">Active</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mb-1" />
                    <span className="font-medium">{stats?.completedScans || 0}</span>
                    <span className="text-xs text-gray-400">Completed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <XCircle className="h-4 w-4 text-red-500 mb-1" />
                    <span className="font-medium">{stats?.failedScans || 0}</span>
                    <span className="text-xs text-gray-400">Failed</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Vulnerabilities Card */}
        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent-blue" />
              Vulnerabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 text-accent-blue animate-spin" />
              </div>
            ) : statsError ? (
              <div className="text-red-400 text-sm">Error loading data</div>
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.totalVulnerabilities || 0}</div>
                <div className="text-xs text-gray-400 mt-1">Total vulnerabilities found</div>
                <div className="flex mt-4 justify-between text-sm">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mb-1"></div>
                    <span className="font-medium">{stats?.highSeverity || 0}</span>
                    <span className="text-xs text-gray-400">High</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mb-1"></div>
                    <span className="font-medium">{stats?.mediumSeverity || 0}</span>
                    <span className="text-xs text-gray-400">Medium</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mb-1"></div>
                    <span className="font-medium">{stats?.lowSeverity || 0}</span>
                    <span className="text-xs text-gray-400">Low</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Score Card */}
        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent-blue" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 text-accent-blue animate-spin" />
              </div>
            ) : statsError ? (
              <div className="text-red-400 text-sm">Error loading data</div>
            ) : (
              <>
                <div className="text-3xl font-bold">{securityScore}/100</div>
                <div className="text-xs text-gray-400 mt-1">Overall security rating</div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Current score</span>
                    {/* We could calculate the difference from previous scans here for real data */}
                  </div>
                  <Progress value={securityScore} className="h-2 bg-gray-700" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reports Card */}
        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent-blue" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 text-accent-blue animate-spin" />
              </div>
            ) : statsError ? (
              <div className="text-red-400 text-sm">Error loading data</div>
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.completedScans || 0}</div>
                <div className="text-xs text-gray-400 mt-1">Generated reports</div>
                <div className="mt-4">
                  <Link href="/dashboard/reports">
                    <Button variant="outline" size="sm" className="w-full border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                      View All Reports
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
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
              {isLoadingScans ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-blue" />
                  </td>
                </tr>
              ) : scansError ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-red-400">
                    Error loading recent scans
                  </td>
                </tr>
              ) : recentScans?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">
                    No scans found
                  </td>
                </tr>
              ) : (
                recentScans?.map((scan) => (
                  <tr key={scan.id} className="border-b border-accent-blue/10 hover:bg-primary-medium/20">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[200px]">{scan.targetUrl}</span>
                        <span className="text-xs text-gray-400">{scan.type} scan</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(scan.status)}`}>
                        {scan.status === 'running' ? 'Active' : 
                         scan.status === 'completed' ? 'Completed' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {formatDate(scan.startTime)}
                    </td>
                    <td className="py-3 px-4">
                      {scan.status === 'completed' && scan.summary ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{scan.summary.total}</span>
                          {scan.summary.high > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-500 border border-red-500/20">
                              {scan.summary.high} High
                            </span>
                          )}
                        </div>
                      ) : scan.status === 'running' ? (
                        <div className="flex items-center gap-2">
                          <Progress value={scan.progress} className="h-1.5 w-16 bg-gray-700" />
                          <span className="text-xs text-gray-400">{scan.progress}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/scans/${scan.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-accent-blue hover:text-accent-blue/80 hover:bg-accent-blue/10">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
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