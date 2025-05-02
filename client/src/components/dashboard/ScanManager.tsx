import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
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
import { ScanProgressBar } from '@/components/scan/ScanProgressBar';
import { toast } from '@/hooks/use-toast';
import { useScanContext } from '@/contexts/ScanContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

interface Scan {
  id: string;
  url: string;
  status: 'completed' | 'active' | 'failed' | 'scheduled' | 'paused';
  date: string;
  progress?: number;
  vulnerabilities?: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  lastScanDuration?: string;
  pagesScanned?: number;
  totalPages?: number;
  vulnerabilitiesFound?: number;
  error?: string;
  scheduledDate?: string;
  frequency?: string;
  type?: 'spider' | 'active';
  targetUrl?: string;
}

interface ScanProgress {
  scanId: string;
  type: 'spider' | 'active';
  status: string;
  progress: number;
  targetUrl: string;
  startTime: Date;
}

interface SubscriptionLimits {
  maxScansPerDay: number;
  maxScansPerMonth: number;
  maxActiveScansConcurrent: number;
  scanDepth: number;
  advancedScanOptions: boolean;
  scheduledScans: boolean;
  scanTypes: string[];
  reportFormats: string[];
  zapFeatures?: string[];
}

const ScanManager: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [showNewScanDialog, setShowNewScanDialog] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [newScanUrl, setNewScanUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeScans, setActiveScans] = useState<Scan[]>([]);
  const [scanHistory, setScanHistory] = useState<Scan[]>([]);
  const { scanProgress } = useScanContext();
  
  const [scanConfig, setScanConfig] = useState({
    depth: 3,
    scope: 'quick' as 'quick' | 'full',
    useAdvancedOptions: false,
  });
  
  const [subscriptionLimits, setSubscriptionLimits] = useState<SubscriptionLimits | null>(null);
  const [isLoadingLimits, setIsLoadingLimits] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
  
  const [scanError, setScanError] = useState<{title: string, message: string} | null>(null);

  const [useAjaxSpider, setUseAjaxSpider] = useState(false);
  const [apiImportUrl, setApiImportUrl] = useState('');
  const [customPolicy, setCustomPolicy] = useState('');
  const [contextAuth, setContextAuth] = useState('');
  const [authType, setAuthType] = useState<'none' | 'form' | 'json'>('none');
  const [authConfig, setAuthConfig] = useState<{ [key: string]: any }>({});

  // Fetch initial data
  useEffect(() => {
    fetchActiveScans();
    fetchScanHistory();
    fetchSubscriptionLimits();
  }, []);

  // Handle dialog open - refresh subscription data when dialog opens
  useEffect(() => {
    if (showNewScanDialog) {
      fetchSubscriptionLimits();
    }
  }, [showNewScanDialog]);

  useEffect(() => {
    const updatedActiveScans = activeScans.map(scan => {
      const progress = scanProgress.get(scan.id);
      if (progress) {
        return {
          ...scan,
          progress: typeof progress === 'number' ? progress : 0
        };
      }
      return scan;
    });

    scanProgress.forEach((progress, scanId) => {
      if (!activeScans.find(scan => scan.id === scanId)) {
        updatedActiveScans.push({
          id: scanId,
          url: 'Loading...',
          status: 'active' as const,
          date: new Date().toLocaleDateString(),
          progress: typeof progress === 'number' ? progress : 0
        });
      }
    });

    setActiveScans(updatedActiveScans);
  }, [scanProgress]);

  const fetchSubscriptionLimits = async () => {
    try {
      setIsLoadingLimits(true);
      console.log("Fetching subscription data...");
      const { data } = await axios.get('/api/subscription');
      console.log("Subscription data loaded:", data);
      
      if (data && data.limits) {
        setSubscriptionLimits({ ...data.limits, zapFeatures: data.limits.zapFeatures || [] });
        setSubscriptionTier(data.tier || 'free');
        
        // Reset options based on new limits
        setAdvancedOptions(data.limits.advancedScanOptions);
        
        // Update scan depth based on new limits
        setScanConfig(prev => ({
          ...prev,
          depth: Math.min(prev.depth, data.limits.scanDepth)
        }));
        
        // Log the features to help debug
        console.log("Available ZAP features:", data.limits.zapFeatures || []);
        console.log("Advanced options enabled:", data.limits.advancedScanOptions);
      }
    } catch (error) {
      console.error('Failed to fetch subscription limits:', error);
      toast({
        title: "Warning",
        description: "Could not load subscription information. Some features may be limited.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLimits(false);
    }
  };

  const fetchActiveScans = async () => {
    try {
      const response = await fetch('/api/zap/active-scans');
      if (!response.ok) throw new Error('Failed to fetch active scans');
      const data = await response.json();
      setActiveScans(data);
    } catch (error) {
      console.error('Error fetching active scans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch active scans",
        variant: "destructive"
      });
    }
  };

  const fetchScanHistory = async () => {
    try {
      const response = await fetch('/api/zap/scan-history');
      if (!response.ok) throw new Error('Failed to fetch scan history');
      const data = await response.json();
      
      const formattedScans = data.map((scan: any) => ({
        id: scan.id,
        url: scan.targetUrl,
        status: scan.status,
        date: new Date(scan.startTime).toLocaleString(),
        progress: scan.progress,
        type: scan.type,
        targetUrl: scan.targetUrl,
        lastScanDuration: scan.endTime ? 
          getTimeDuration(new Date(scan.startTime), new Date(scan.endTime)) : 
          undefined,
        vulnerabilities: scan.summary
      }));
      
      setScanHistory(formattedScans);
    } catch (error) {
      console.error('Error fetching scan history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scan history",
        variant: "destructive"
      });
    }
  };

  const getTimeDuration = (startDate: Date, endDate: Date): string => {
    const durationMs = endDate.getTime() - startDate.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const handleStartScan = async () => {
    setScanError(null);
    if (!newScanUrl) {
      setScanError({
        title: "Error",
        message: "Please enter a URL to scan"
      });
      toast({
        title: "Error",
        description: "Please enter a URL to scan",
        variant: "destructive"
      });
      return;
    }
    try {
      new URL(newScanUrl);
    } catch (e) {
      setScanError({
        title: "Invalid URL",
        message: "Please enter a valid URL (e.g., https://example.com)"
      });
      toast({
        title: "Error",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive"
      });
      return;
    }
    let parsedContextAuth = undefined;
    if (authType === 'json') {
      if (!contextAuth) {
        setScanError({
          title: "Missing Auth Config",
          message: "Please provide a valid JSON authentication config."
        });
        toast({
          title: "Error",
          description: "Please provide a valid JSON authentication config.",
          variant: "destructive"
        });
        return;
      }
      try {
        parsedContextAuth = JSON.parse(contextAuth.replace(/'/g, '"'));
      } catch (error) {
        setScanError({
          title: "Invalid JSON",
          message: "Please enter valid JSON for authentication configuration"
        });
        toast({
          title: "Error",
          description: "Please enter valid JSON for authentication configuration",
          variant: "destructive"
        });
        return;
      }
    }
    setIsLoading(true);
    try {
      const config = {
        depth: Math.min(scanConfig.depth, subscriptionLimits?.scanDepth || 3),
        scope: subscriptionLimits?.advancedScanOptions ? scanConfig.scope : 'quick',
      };
      const body = {
        url: newScanUrl,
        config,
        ajax: useAjaxSpider || undefined,
        apiImport: apiImportUrl || undefined,
        customPolicy: customPolicy || undefined,
        contextAuth: parsedContextAuth // Only send if present, else undefined
      };
      const response = await fetch('/api/zap/spider-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const errorData = await response.json();
        setScanError({
          title: errorData.error || "Error",
          message: errorData.message || "Failed to start scan. Please try again later."
        });
        toast({
          title: errorData.error || "Error",
          description: errorData.message || "Failed to start scan. Please try again later.",
          variant: "destructive"
        });
        throw new Error(errorData.message || 'Failed to start scan');
      }
      const { scanId: spiderScanId } = await response.json();
      const spiderScan: Scan = {
        id: spiderScanId,
        url: newScanUrl,
        status: 'active',
        date: new Date().toISOString(),
        progress: 0,
        type: 'spider',
        targetUrl: newScanUrl
      };
      setActiveScans(prev => [...prev, spiderScan]);
      setScanHistory(prev => [...prev, spiderScan]);
      setShowNewScanDialog(false);
      setNewScanUrl('');
      toast({
        title: "Success",
        description: "Spider scan started successfully",
      });
    } catch (error) {
      console.error('Error starting scan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanComplete = (scanId: string) => {
    setActiveScans(prev => {
      const scan = prev.find(s => s.id === scanId);
      if (!scan) return prev;

      if (scan.type === 'spider') {
        return prev.map(s => 
          s.id === scanId 
            ? { ...s, progress: 100 }
            : s
        );
      }

      if (scan.type === 'active') {
        return prev.filter(s => s.id !== scanId);
      }

      return prev;
    });

    fetchScanHistory();

    toast({
      title: "Scan Progress",
      description: "The scan phase has completed successfully",
    });
  };

  const handleCloseScan = (scanId: string) => {
    setActiveScans(prev => {
      const scan = prev.find(s => s.id === scanId);
      if (!scan) return prev;

      if (scan.progress === 100) {
        return prev.filter(s => s.id !== scanId);
      }
      return prev;
    });
  };

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

  const handleViewReport = (scanId: string) => {
    if (!scanId || typeof scanId !== 'string' || scanId.trim() === '') {
      toast({
        title: "Error",
        description: "Invalid scan ID. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLocation(`/scans/${scanId.trim()}`);
  };

  const filteredScans = scanHistory.filter(scan => {
    if (activeTab === 'all') return true;
    return scan.status === activeTab;
  });

  // Function to handle subscription plan change (for testing)
  const handlePlanChange = async (newPlan: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/subscription/update', {
        tier: newPlan
      });
      
      console.log("Plan update response:", response.data);
      
      toast({
        title: "Success",
        description: `Your plan has been updated to ${newPlan}`,
      });
      
      // Immediately refresh subscription data
      await fetchSubscriptionLimits();
      
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: "Failed to update your subscription plan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Scan Manager</h1>
            <p className="text-gray-400">Start, monitor, and manage your web security scans</p>
          </div>
          <div className="flex gap-2">
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
                    {scanError && (
                      <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md text-red-400 mb-2">
                        <div className="font-semibold flex items-center mb-1">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {scanError.title}
                        </div>
                        <p className="text-sm">{scanError.message}</p>
                      </div>
                    )}
                  
                  <div className="space-y-2">
                    <label htmlFor="scan-url" className="text-sm font-medium text-gray-300">
                      Website URL
                    </label>
                    <Input 
                      id="scan-url"
                      placeholder="https://yourdomain.com"
                      className="bg-white/10 border-accent-blue/20 text-white placeholder:text-gray-400"
                      value={newScanUrl}
                      onChange={(e) => setNewScanUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-400">
                      Make sure you have permission to scan this website.
                    </p>
                  </div>
                    
                    <div className="space-y-2 pt-2">
                      <label htmlFor="scan-depth" className="text-sm font-medium text-gray-300">
                        Scan Depth (1-{subscriptionLimits?.scanDepth || 3})
                      </label>
                      <Select 
                        value={scanConfig.depth.toString()} 
                        onValueChange={(value) => setScanConfig({...scanConfig, depth: parseInt(value)})}>
                        <SelectTrigger className="bg-white/10 border-accent-blue/20 text-white">
                          <SelectValue placeholder="Select scan depth" />
                        </SelectTrigger>
                        <SelectContent className="bg-primary-medium border-accent-blue/20 text-white">
                          {Array.from({length: subscriptionLimits?.scanDepth || 3}, (_, i) => i + 1).map(depth => (
                            <SelectItem key={depth} value={depth.toString()}>{depth}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-400">Higher values scan deeper but take longer</p>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={() => setAdvancedOptions(!advancedOptions)}
                      className="flex items-center text-sm text-accent-blue hover:text-accent-blue/80"
                        disabled={!subscriptionLimits?.advancedScanOptions}
                    >
                      <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${advancedOptions ? 'rotate-180' : ''}`} />
                        Advanced Options {!subscriptionLimits?.advancedScanOptions && '(Upgrade Required)'}
                    </button>
                    
                      {advancedOptions && subscriptionLimits?.advancedScanOptions && (
                      <div className="space-y-3 mt-3 pl-2 border-l-2 border-accent-blue/20">
                          {subscriptionLimits?.zapFeatures?.includes('ajaxSpider') && (
                        <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="ajax-spider" 
                                checked={useAjaxSpider} 
                                onCheckedChange={(checked) => setUseAjaxSpider(!!checked)}
                              />
                              <label htmlFor="ajax-spider" className="text-sm text-gray-300">
                                Use AJAX Spider (for JS-heavy apps)
                          </label>
                        </div>
                          )}
                          {subscriptionLimits?.zapFeatures?.some(f => ['apiImport','swaggerImport','graphqlImport'].includes(f)) && (
                            <div className="space-y-1">
                              <label htmlFor="api-import-url" className="text-sm text-gray-300">
                                Import API Definition (OpenAPI/Swagger/GraphQL URL)
                          </label>
                              <Input
                                id="api-import-url"
                                placeholder="https://yourdomain.com/openapi.json"
                                className="bg-white/10 border-accent-blue/20 text-white placeholder:text-gray-400"
                                value={apiImportUrl}
                                onChange={e => setApiImportUrl(e.target.value)}
                              />
                              <p className="text-xs text-gray-400">Enterprise only: Import API definitions for API security testing</p>
                        </div>
                          )}
                          {subscriptionLimits?.zapFeatures?.includes('customScanPolicy') && (
                            <div className="space-y-1">
                              <label htmlFor="custom-policy" className="text-sm text-gray-300">
                                Custom Scan Policy (JSON or Policy Name)
                          </label>
                              <Input
                                id="custom-policy"
                                placeholder="e.g. MyPolicy or JSON config"
                                className="bg-white/10 border-accent-blue/20 text-white placeholder:text-gray-400"
                                value={customPolicy}
                                onChange={e => setCustomPolicy(e.target.value)}
                              />
                              <p className="text-xs text-gray-400">Pro/Enterprise: Fine-tune which rules are used in the scan</p>
                            </div>
                          )}
                          {subscriptionLimits?.zapFeatures?.includes('contextAuth') && (
                            <div className="space-y-1">
                              <label htmlFor="auth-type" className="text-sm text-gray-300">
                                Authentication Type
                              </label>
                              <Select
                                value={authType}
                                onValueChange={(value) => setAuthType(value as 'none' | 'form' | 'json')}
                              >
                                <SelectTrigger className="bg-white/10 border-accent-blue/20 text-white">
                                  <SelectValue placeholder="Select authentication type" />
                                </SelectTrigger>
                                <SelectContent className="bg-primary-medium border-accent-blue/20 text-white">
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="form">Form-based</SelectItem>
                                  <SelectItem value="json">JSON-based</SelectItem>
                                </SelectContent>
                              </Select>
                              {authType === 'json' && (
                                <div className="space-y-1 mt-2">
                                  <label htmlFor="context-auth" className="text-sm text-gray-300 flex items-center">
                                    Context/Auth Config (JSON)
                                    <div className="ml-1 relative group">
                                      <span className="cursor-help text-gray-400">ⓘ</span>
                                      <div className="absolute bottom-full left-0 mb-2 w-96 p-2 bg-gray-800 rounded-md text-xs shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                                        <p className="font-medium mb-1">Auth Config Format Examples:</p>
                                        <p className="mb-1"><strong>OWASP Juice Shop:</strong></p>
                                        <pre className="bg-gray-900 p-1 rounded text-xs overflow-auto">
{`{
  "authType": "form",
  "loginUrl": "http://localhost:3000/rest/user/login",
  "loginRequestData": {"email":"admin@juice-sh.op","password":"admin123"},
  "loginPageValidationRegex": "\\\\{\\\"authentication\\\":\\\\{\\\"token\\\":\\\"(.*?)\\\"",
  "credentials": {
    "username": "admin@juice-sh.op",
    "password": "admin123"
  },
  "headers": {
    "Content-Type": "application/json"
  }
}`}
                                        </pre>
                                      </div>
                                    </div>
                                  </label>
                                  <Input
                                    id="context-auth"
                                    placeholder='{"authType":"form","loginUrl":"http://localhost:3000/rest/user/login"...}'
                                    className="bg-white/10 border-accent-blue/20 text-white placeholder:text-gray-500 font-mono text-xs"
                                    value={contextAuth}
                                    onChange={e => setContextAuth(e.target.value)}
                                  />
                                  <p className="text-xs text-gray-400">Enterprise: Authenticated/context-aware scans</p>
                                  {contextAuth.includes("'") && (
                                    <p className="text-amber-400 text-xs">Note: Use double quotes (") instead of single quotes (') for valid JSON</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {subscriptionLimits && (
                        <div className="mt-4 p-3 bg-accent-blue/10 rounded-md border border-accent-blue/20">
                          <p className="text-xs text-accent-blue mb-1 font-medium">Your Plan Limits ({subscriptionTier}):</p>
                          <ul className="text-xs text-gray-400 space-y-1">
                            <li>• {subscriptionLimits.maxScansPerDay} scans per day</li>
                            <li>• {subscriptionLimits.maxScansPerMonth} scans per month</li>
                            <li>• {subscriptionLimits.maxActiveScansConcurrent} concurrent scans</li>
                            <li>• Max scan depth: {subscriptionLimits.scanDepth}</li>
                            <li>• Advanced options: {subscriptionLimits.advancedScanOptions ? 'Yes' : 'No'}</li>
                          </ul>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-accent-blue p-0 mt-1 h-auto text-xs"
                            onClick={() => fetchSubscriptionLimits()}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Refresh Plan Data
                          </Button>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewScanDialog(false)} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button 
                    className="bg-accent-blue hover:bg-accent-blue/90 text-white"
                    onClick={handleStartScan}
                    disabled={isLoading}
                  >
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Starting Scan...
                        </>
                      ) : (
                        <>Start Scan</>
                      )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Plan Switcher for Testing (this would normally be in Settings) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Test Plans
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-primary-medium border-accent-blue/20 text-white">
                <DropdownMenuItem onClick={() => handlePlanChange('free')}>
                  Switch to Free Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePlanChange('basic')}>
                  Switch to Basic Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePlanChange('professional')}>
                  Switch to Professional Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePlanChange('enterprise')}>
                  Switch to Enterprise Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Scans</h2>
        {activeScans.length > 0 ? (
          activeScans.map((scan) => (
          <div key={scan.id} className="space-y-4">
            <ScanProgressBar
              scanId={scan.id}
              initialProgress={scanProgress.get(scan.id)}
              onComplete={() => handleScanComplete(scan.id)}
              onClose={() => handleCloseScan(scan.id)}
            />
          </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-400 border border-dashed border-gray-600 rounded-lg">
            <ShieldAlert className="h-10 w-10 mx-auto mb-3 text-gray-500" />
            <p>No active scans. Start a new scan to detect vulnerabilities.</p>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-300">Scan History</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4">
          {filteredScans.length > 0 ? (
            filteredScans.map(scan => (
            <Card key={scan.id} className="bg-primary-medium/50 border-accent-blue/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-accent-blue/20 rounded-lg">
                      <ShieldAlert className="h-5 w-5 text-accent-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-200">{scan.url}</h3>
                      <p className="text-sm text-gray-400">
                        {scan.date} • {scan.lastScanDuration || 'In progress'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(scan.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewReport(scan.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      View Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400 border border-dashed border-gray-600 rounded-lg">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 text-gray-500" />
              <p>No scan history found. Start a new scan to see results here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ScanManager;