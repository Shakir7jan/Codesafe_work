import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  Play,
  Trash,
  PauseCircle,
  ShieldAlert,
  BarChart3,
  AlertCircle,
  InfoIcon,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import ScanDetailReport from './ScanDetailReport';

// Mock scan data
const mockScans = [
  {
    id: 1,
    url: 'https://example.com',
    status: 'completed',
    date: '2023-08-15',
    vulnerabilities: {
      total: 12,
      high: 3,
      medium: 4,
      low: 5
    },
    lastScanDuration: '1h 23m',
    pagesScanned: 53
  },
  {
    id: 2,
    url: 'https://dashboard.example.org',
    status: 'active',
    date: '2023-08-20',
    progress: 68,
    estimatedTimeRemaining: '32m',
    pagesScanned: 42,
    totalPages: 74,
    vulnerabilitiesFound: 8
  },
  {
    id: 3,
    url: 'https://store.example.io',
    status: 'failed',
    date: '2023-08-14',
    error: 'Connection timeout',
    lastScanDuration: '43m',
  },
  {
    id: 4,
    url: 'https://blog.example.net',
    status: 'completed',
    date: '2023-08-10',
    vulnerabilities: {
      total: 5,
      high: 0,
      medium: 2,
      low: 3
    },
    lastScanDuration: '47m',
    pagesScanned: 31
  },
  {
    id: 5,
    url: 'https://api.example.io',
    status: 'scheduled',
    scheduledDate: '2023-08-25 14:30',
    frequency: 'Weekly',
  },
  {
    id: 6,
    url: 'https://staging.example.com',
    status: 'paused',
    date: '2023-08-12',
    progress: 34,
    pagesScanned: 15,
    totalPages: 44,
    vulnerabilitiesFound: 3
  },
];

const ScanManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showNewScanDialog, setShowNewScanDialog] = useState(false);
  const [newScanUrl, setNewScanUrl] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  
  // Filter scans based on active tab
  const filteredScans = mockScans.filter(scan => {
    if (activeTab === 'all') return true;
    return scan.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 border border-green-500/30">Completed</Badge>;
      case 'active':
        return <Badge className="bg-blue-500/20 text-blue-500 border border-blue-500/30">In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500 border border-red-500/30">Failed</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-500/20 text-purple-500 border border-purple-500/30">Scheduled</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">Paused</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-500 border border-gray-500/30">{status}</Badge>;
    }
  };

  const handleViewReport = (scanId: number) => {
    setSelectedScanId(scanId);
  };

  const handleBackToList = () => {
    setSelectedScanId(null);
  };

  // If a specific scan is selected, show its detail report
  if (selectedScanId !== null) {
    return <ScanDetailReport scanId={selectedScanId} onBack={handleBackToList} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Scan Manager</h1>
          <p className="text-gray-400">Start, monitor, and manage your web security scans</p>
        </div>
        <Dialog open={showNewScanDialog} onOpenChange={setShowNewScanDialog}>
          <DialogTrigger asChild>
            <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
              <Search className="mr-2 h-4 w-4" />
              New Scan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-primary-medium border-accent-blue/20 text-gray-100 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Start New Security Scan</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the URL you want to scan for vulnerabilities
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="scan-url" className="text-sm font-medium text-gray-300">
                  Website URL
                </label>
                <Input 
                  id="scan-url"
                  placeholder="https://yourdomain.com"
                  className="bg-primary-dark border-accent-blue/30 text-gray-100"
                  value={newScanUrl}
                  onChange={(e) => setNewScanUrl(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  Make sure you have permission to scan this website.
                </p>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => setAdvancedOptions(!advancedOptions)}
                  className="flex items-center text-sm text-accent-blue hover:text-accent-blue/80"
                >
                  <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${advancedOptions ? 'rotate-180' : ''}`} />
                  Advanced Options
                </button>
                
                {advancedOptions && (
                  <div className="space-y-3 mt-3 pl-2 border-l-2 border-accent-blue/20">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="crawl-depth" />
                      <label htmlFor="crawl-depth" className="text-sm text-gray-300">
                        Limit crawl depth
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="login-required" />
                      <label htmlFor="login-required" className="text-sm text-gray-300">
                        Authentication required
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="passive-only" />
                      <label htmlFor="passive-only" className="text-sm text-gray-300">
                        Passive scan only (non-intrusive)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="browser-scan" />
                      <label htmlFor="browser-scan" className="text-sm text-gray-300">
                        Include browser-based scanning (for SPAs)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="schedule-scan" />
                      <label htmlFor="schedule-scan" className="text-sm text-gray-300">
                        Schedule recurring scan
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewScanDialog(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                Start Scan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Scans</p>
                <h2 className="text-2xl font-bold">{mockScans.length}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <Search className="h-5 w-5 text-accent-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Scans</p>
                <h2 className="text-2xl font-bold">{mockScans.filter(scan => scan.status === 'active').length}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Vulnerabilities Found</p>
                <h2 className="text-2xl font-bold">
                  {mockScans
                    .filter(scan => scan.status === 'completed')
                    .reduce((total, scan) => total + (scan.vulnerabilities?.total || 0), 0)}
                </h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary-medium/30 border-accent-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Scheduled Scans</p>
                <h2 className="text-2xl font-bold">{mockScans.filter(scan => scan.status === 'scheduled').length}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-primary-medium/30 border-accent-blue/20">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search scans..." 
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

      {/* Scan Tabs and List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-primary-medium/30 border border-accent-blue/20 p-1">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            All Scans
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Active
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger 
            value="failed" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Failed
          </TabsTrigger>
          <TabsTrigger 
            value="scheduled" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Scheduled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredScans.map((scan) => (
            <Card 
              key={scan.id}
              className="bg-primary-medium/30 border-accent-blue/20 hover:border-accent-blue/40 transition-all hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium">{scan.url}</h3>
                      {getStatusBadge(scan.status)}
                    </div>
                    
                    {/* Scan metadata - different based on status */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{scan.date || scan.scheduledDate}</span>
                      </div>
                      
                      {scan.status === 'completed' && (
                        <>
                          <div className="flex items-center text-gray-400">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Duration: {scan.lastScanDuration}</span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span>Issues: {scan.vulnerabilities?.total || 0}</span>
                          </div>
                        </>
                      )}
                      
                      {scan.status === 'active' && (
                        <>
                          <div className="flex items-center text-gray-400">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Remaining: {scan.estimatedTimeRemaining}</span>
                          </div>
                          {scan.vulnerabilitiesFound !== undefined && (
                            <div className="flex items-center text-gray-400">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span>Found: {scan.vulnerabilitiesFound}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {scan.status === 'failed' && (
                        <div className="flex items-center text-red-400 col-span-2">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span>Error: {scan.error}</span>
                        </div>
                      )}
                      
                      {scan.status === 'scheduled' && (
                        <div className="flex items-center text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Frequency: {scan.frequency}</span>
                        </div>
                      )}
                      
                      {scan.status === 'paused' && (
                        <>
                          <div className="flex items-center text-gray-400">
                            <PauseCircle className="h-4 w-4 mr-1" />
                            <span>Paused at {scan.progress}%</span>
                          </div>
                          {scan.vulnerabilitiesFound !== undefined && (
                            <div className="flex items-center text-gray-400">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span>Found: {scan.vulnerabilitiesFound}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar for active and paused scans */}
                  {(scan.status === 'active' || scan.status === 'paused') && (
                    <div className="w-full md:w-64">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress: {scan.progress}%</span>
                        <span>{scan.pagesScanned} / {scan.totalPages} pages</span>
                      </div>
                      <Progress 
                        value={scan.progress} 
                        className="h-2 bg-primary-dark"
                        indicatorClassName={`${scan.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                      />
                    </div>
                  )}
                  
                  {/* Vulnerability summary for completed scans */}
                  {scan.status === 'completed' && scan.vulnerabilities && (
                    <div className="flex space-x-3">
                      <div className="flex flex-col items-center px-3 py-1 bg-primary-dark/40 rounded-md">
                        <span className="text-xs text-gray-400">High</span>
                        <span className="text-lg font-bold text-red-500">{scan.vulnerabilities.high}</span>
                      </div>
                      <div className="flex flex-col items-center px-3 py-1 bg-primary-dark/40 rounded-md">
                        <span className="text-xs text-gray-400">Medium</span>
                        <span className="text-lg font-bold text-yellow-500">{scan.vulnerabilities.medium}</span>
                      </div>
                      <div className="flex flex-col items-center px-3 py-1 bg-primary-dark/40 rounded-md">
                        <span className="text-xs text-gray-400">Low</span>
                        <span className="text-lg font-bold text-blue-500">{scan.vulnerabilities.low}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {scan.status === 'completed' && (
                      <Button 
                        className="bg-accent-blue hover:bg-accent-blue/90 text-white"
                        onClick={() => handleViewReport(scan.id)}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Report
                      </Button>
                    )}
                    
                    {scan.status === 'active' && (
                      <Button variant="outline" className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10">
                        <PauseCircle className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    )}
                    
                    {scan.status === 'paused' && (
                      <Button variant="outline" className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </Button>
                    )}
                    
                    {(scan.status === 'failed' || scan.status === 'scheduled') && (
                      <Button variant="outline" className="border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10">
                        <Play className="mr-2 h-4 w-4" />
                        Start Scan
                      </Button>
                    )}
                    
                    {scan.status !== 'active' && (
                      <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScanManager;