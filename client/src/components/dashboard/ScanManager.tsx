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
  PauseCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Mock scan data
const mockScans = [
  {
    id: 1,
    url: 'https://example.com',
    status: 'completed',
    date: '2025-02-28',
    vulnerabilities: 5,
    highSeverity: 1,
    mediumSeverity: 2,
    lowSeverity: 2,
    lastScanDuration: '1h 23m',
  },
  {
    id: 2,
    url: 'https://dashboard.example.org',
    status: 'active',
    date: '2025-03-01',
    progress: 68,
    estimatedTimeRemaining: '32m',
    pagesScanned: 42,
    totalPages: 74,
  },
  {
    id: 3,
    url: 'https://store.example.io',
    status: 'failed',
    date: '2025-02-25',
    error: 'Connection timeout',
    lastScanDuration: '43m',
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
    lastScanDuration: '47m',
  },
  {
    id: 5,
    url: 'https://api.example.io',
    status: 'scheduled',
    scheduledDate: '2025-03-05 14:30',
    frequency: 'Weekly',
  },
  {
    id: 6,
    url: 'https://staging.example.com',
    status: 'paused',
    date: '2025-02-26',
    progress: 34,
    pagesScanned: 15,
    totalPages: 44,
  },
];

const ScanManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showNewScanDialog, setShowNewScanDialog] = useState(false);
  const [newScanUrl, setNewScanUrl] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState(false);
  
  // Filter scans based on active tab
  const filteredScans = mockScans.filter(scan => {
    if (activeTab === 'all') return true;
    return scan.status === activeTab;
  });

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
            value="scheduled" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Scheduled
          </TabsTrigger>
          <TabsTrigger 
            value="failed" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Failed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filteredScans.length > 0 ? (
              filteredScans.map((scan) => (
                <Card
                  key={scan.id}
                  className={`
                    bg-primary-medium/30 border-accent-blue/20 transition-all hover:border-accent-blue/40
                    ${scan.status === 'active' ? 'border-l-4 border-l-yellow-500' : ''}
                    ${scan.status === 'completed' ? 'border-l-4 border-l-green-500' : ''}
                    ${scan.status === 'failed' ? 'border-l-4 border-l-red-500' : ''}
                    ${scan.status === 'scheduled' ? 'border-l-4 border-l-blue-500' : ''}
                    ${scan.status === 'paused' ? 'border-l-4 border-l-gray-500' : ''}
                  `}
                >
                  <CardContent className="p-0">
                    <div className="p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-100">{scan.url}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-400">
                            {scan.status === 'completed' && (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-500 mr-2">Completed</span>
                                <span>Scanned on {scan.date}</span>
                              </>
                            )}
                            {scan.status === 'active' && (
                              <>
                                <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-yellow-500 mr-2">In Progress</span>
                                <span>Started on {scan.date}</span>
                              </>
                            )}
                            {scan.status === 'failed' && (
                              <>
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-red-500 mr-2">Failed</span>
                                <span>Attempted on {scan.date}</span>
                              </>
                            )}
                            {scan.status === 'scheduled' && (
                              <>
                                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                                <span className="text-blue-500 mr-2">Scheduled</span>
                                <span>Will run on {scan.scheduledDate}</span>
                              </>
                            )}
                            {scan.status === 'paused' && (
                              <>
                                <PauseCircle className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-gray-500 mr-2">Paused</span>
                                <span>Started on {scan.date}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex mt-3 md:mt-0 space-x-2">
                          {scan.status === 'completed' && (
                            <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                              View Report
                            </Button>
                          )}
                          {scan.status === 'active' && (
                            <Button variant="outline" className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10">
                              Pause
                            </Button>
                          )}
                          {scan.status === 'failed' && (
                            <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                              <Play className="mr-2 h-4 w-4" />
                              Retry Scan
                            </Button>
                          )}
                          {scan.status === 'scheduled' && (
                            <Button variant="outline" className="border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                              Edit Schedule
                            </Button>
                          )}
                          {scan.status === 'paused' && (
                            <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                              <Play className="mr-2 h-4 w-4" />
                              Resume
                            </Button>
                          )}
                          <Button variant="outline" className="border-gray-600 text-gray-300">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Status Specific Content */}
                      {scan.status === 'active' && (
                        <div className="mt-4 space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress: {scan.progress}%</span>
                              <span className="text-gray-400">Estimated time remaining: {scan.estimatedTimeRemaining}</span>
                            </div>
                            <Progress value={scan.progress} className="h-2 bg-gray-700" />
                          </div>
                          <div className="text-sm text-gray-400">
                            Scanned {scan.pagesScanned} of approximately {scan.totalPages} pages
                          </div>
                        </div>
                      )}

                      {scan.status === 'paused' && (
                        <div className="mt-4 space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress: {scan.progress}%</span>
                              <span className="text-gray-400">Scan paused</span>
                            </div>
                            <Progress value={scan.progress} className="h-2 bg-gray-700" />
                          </div>
                          <div className="text-sm text-gray-400">
                            Scanned {scan.pagesScanned} of approximately {scan.totalPages} pages before pausing
                          </div>
                        </div>
                      )}

                      {scan.status === 'completed' && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-primary-dark/30 rounded-lg p-3">
                            <div className="flex items-center">
                              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                              <span className="text-lg font-medium">{scan.highSeverity}</span>
                              <span className="ml-2 text-sm text-gray-400">High Severity</span>
                            </div>
                          </div>
                          <div className="bg-primary-dark/30 rounded-lg p-3">
                            <div className="flex items-center">
                              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                              <span className="text-lg font-medium">{scan.mediumSeverity}</span>
                              <span className="ml-2 text-sm text-gray-400">Medium Severity</span>
                            </div>
                          </div>
                          <div className="bg-primary-dark/30 rounded-lg p-3">
                            <div className="flex items-center">
                              <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
                              <span className="text-lg font-medium">{scan.lowSeverity}</span>
                              <span className="ml-2 text-sm text-gray-400">Low Severity</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {scan.status === 'failed' && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-start">
                            <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium text-red-400">Scan Failed</p>
                              <p className="text-sm text-gray-300 mt-1">{scan.error}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {scan.status === 'scheduled' && (
                        <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-start">
                            <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-400">Scheduled Scan</p>
                              <p className="text-sm text-gray-300 mt-1">
                                Next scan scheduled for {scan.scheduledDate} ({scan.frequency} frequency)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-medium/50 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium">No scans found</h3>
                <p className="text-gray-400 mt-2">
                  {activeTab === 'all' 
                    ? "You haven't run any scans yet. Start a new scan to begin monitoring your website security."
                    : `You don't have any ${activeTab} scans.`}
                </p>
                <Button 
                  onClick={() => setShowNewScanDialog(true)}
                  className="mt-6 bg-accent-blue hover:bg-accent-blue/90 text-white"
                >
                  Start New Scan
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScanManager;