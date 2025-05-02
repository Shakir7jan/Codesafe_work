import React, { useState, useEffect } from 'react';
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
import { toast } from '@/hooks/use-toast';

// Interface for Scan/Report data
interface Report {
  id: string;
  url: string;
  scanDate: string;
  vulnerabilities: {
    total: number;
    high: number;
    medium: number;
    low: number;
    informational?: number;
  };
  scanDuration: string;
  pagesScanned?: number;
  status?: string;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch scan reports on component mount
  useEffect(() => {
    fetchScanReports();
  }, []);

  const fetchScanReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/zap/scan-history');
      if (!response.ok) throw new Error('Failed to fetch scan reports');
      const data = await response.json();

      // Map the scan data to the expected format for the UI
      const formattedReports = data.map((scan: any) => ({
        id: scan.id,
        url: scan.targetUrl,
        scanDate: new Date(scan.startTime).toLocaleDateString(),
        vulnerabilities: scan.summary || {
          total: 0,
          high: 0,
          medium: 0,
          low: 0,
          informational: 0
        },
        scanDuration: scan.endTime
          ? getTimeDuration(new Date(scan.startTime), new Date(scan.endTime))
          : 'Unknown',
        pagesScanned: scan.pagesScanned || scan.totalRequests || 0, // Use totalRequests if pagesScanned is missing
        status: scan.status
      }));

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching scan reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scan reports",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to calculate duration between two dates
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

  // Filter reports based on active tab
  const filteredReports = reports.filter(report => {
    if (activeTab === 'all') return true;
    if (activeTab === 'high' && report.vulnerabilities?.high > 0) return true;
    if (activeTab === 'medium' && report.vulnerabilities?.medium > 0) return true;
    if (activeTab === 'low' && report.vulnerabilities?.low > 0) return true;
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
          <p className="text-gray-400">View and manage your security scan reports</p>
        </div>
        <Button 
          className="bg-accent-blue hover:bg-accent-blue/90 text-white"
          onClick={fetchScanReports}
        >
          Refresh Reports
        </Button>
      </div>

      {/* Report Tabs and List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-primary-medium/30 border border-accent-blue/20 p-1">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="high">High Severity</TabsTrigger>
          <TabsTrigger value="medium">Medium Severity</TabsTrigger>
          <TabsTrigger value="low">Low Severity</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No reports found. Complete a scan to generate reports.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="bg-primary-medium/30 border-accent-blue/20">
                  <CardContent className="p-5">
                    <div className="flex justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-medium">{report.url}</h3>
                        <div className="text-sm text-gray-400 mt-1">
                          Scanned on {report.scanDate}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10"
                        onClick={() => window.open(`/api/zap/scan/${report.id}/report/pdf`, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;