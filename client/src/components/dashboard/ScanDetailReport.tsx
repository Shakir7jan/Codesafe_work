import React, { useState, useEffect } from 'react';
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
import { useSubscription } from '@/hooks/use-subscription';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ScanDetailReportProps {
  scanId: string;
  onBack: () => void;
}

const ScanDetailReport: React.FC<ScanDetailReportProps> = ({ scanId, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedVulnerability, setExpandedVulnerability] = useState<number | null>(null);
  const [scanDetails, setScanDetails] = useState<any>(null);
  const [vulnerabilityData, setVulnerabilityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAvailableReportFormats, getBestAvailableReportFormat } = useSubscription();

  useEffect(() => {
    fetchScanDetails();
  }, [scanId]);

  const fetchScanDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/zap/scan/${scanId}`);
      if (!response.ok) throw new Error('Failed to fetch scan details');
      const data = await response.json();

      setScanDetails({
        id: data.scan.id,
        url: data.scan.targetUrl,
        scanDate: new Date(data.scan.startTime).toLocaleDateString(),
        completedDate: data.scan.endTime ? new Date(data.scan.endTime).toLocaleDateString() : 'Unknown',
        status: data.scan.status,
        scanDuration: data.scan.endTime
          ? getTimeDuration(new Date(data.scan.startTime), new Date(data.scan.endTime))
          : 'Unknown',
        pagesScanned: data.scan.pagesScanned || data.scan.totalRequests || 0,
        vulnerabilities: data.summary || {
          total: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      });

      const transformedVulnerabilities = (data.results || []).map((vuln: any, index: number) => ({
        id: index,
        title: vuln.name || 'Unknown Vulnerability',
        description: vuln.description || 'No description available',
        severity: (vuln.risk || 'low').toLowerCase(),
        location: vuln.url || 'Unknown location',
        evidence: vuln.evidence || 'No evidence available',
        remediation: vuln.solution || 'No remediation available',
        references: vuln.reference ? [vuln.reference] : []
      }));

      setVulnerabilityData(transformedVulnerabilities);
    } catch (error) {
      console.error('Error fetching scan details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scan details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://codesafe.ai/reports/${scanId}`);
    toast({
      title: "Link copied",
      description: "The report link has been copied to your clipboard",
    });
  };
  
  const handleDownloadReport = (format?: string) => {
    const availableFormats = getAvailableReportFormats();
    const formatToUse = format || getBestAvailableReportFormat();
    
    if (format && !availableFormats.includes(format)) {
      toast({
        title: `${format.toUpperCase()} format unavailable`,
        description: `Your current plan doesn't support ${format.toUpperCase()} reports. Using ${formatToUse.toUpperCase()} instead.`,
        variant: "default"
      });
    }
    
    window.open(`/api/zap/scan/${scanId}/report/${formatToUse}`, '_blank');
    
    toast({
      title: "Report download started",
      description: `Your ${formatToUse.toUpperCase()} report will be downloaded shortly`
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
    if (!severity) return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    }
  };
  
  const filterVulnerabilities = (tab: string) => {
    if (!vulnerabilityData || vulnerabilityData.length === 0) return [];
    if (tab === 'all') return vulnerabilityData;
    return vulnerabilityData.filter(vuln => vuln.severity === tab);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Loading scan details...</div>;
  }

  if (!scanDetails) {
    return <div className="text-center py-8 text-gray-400">No scan details found.</div>;
  }

  return (
    <div className="space-y-6">
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-primary-medium border-accent-blue/20 text-white">
                {getAvailableReportFormats().map((format) => (
                  <DropdownMenuItem 
                    key={format}
                    onClick={() => handleDownloadReport(format)}
                    className="cursor-pointer"
                  >
                    Download {format.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
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
        
        <TabsContent value="overview" className="space-y-6">
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
                    value={scanDetails.vulnerabilities.total > 0 
                      ? (scanDetails.vulnerabilities.high / scanDetails.vulnerabilities.total) * 100 
                      : 0} 
                    className="bg-primary-dark h-2"
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
                    value={scanDetails.vulnerabilities.total > 0 
                      ? (scanDetails.vulnerabilities.medium / scanDetails.vulnerabilities.total) * 100 
                      : 0} 
                    className="bg-primary-dark h-2"
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
                    value={scanDetails.vulnerabilities.total > 0 
                      ? (scanDetails.vulnerabilities.low / scanDetails.vulnerabilities.total) * 100 
                      : 0} 
                    className="bg-primary-dark h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                            {vuln.severity ? vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1) : 'Unknown'}
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
                              {vuln.references.map((ref: string, index: number) => (
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