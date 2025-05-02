import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useScanContext } from '@/contexts/ScanContext';

interface ScanProgress {
  scanId: string;
  type: 'spider' | 'active';
  status: string;
  progress: number;
  targetUrl: string;
  startTime: Date;
}

interface ScanProgressBarProps {
  scanId: string;
  initialProgress?: ScanProgress;
  onComplete?: () => void;
  onClose?: () => void;
}

export function ScanProgressBar({ scanId, initialProgress, onComplete, onClose }: ScanProgressBarProps) {
  const { scanProgress, isConnecting, error: contextError } = useScanContext();
  const [previousScan, setPreviousScan] = useState<ScanProgress | null>(null);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = scanProgress.get(scanId) || initialProgress;

  useEffect(() => {
    if (progress && progress.type !== previousScan?.type && !hasTransitioned) {
      console.log('Transitioning from spider to active scan');
      setPreviousScan(previousScan);
      setHasTransitioned(true);
    }
  }, [progress, previousScan, hasTransitioned]);

  useEffect(() => {
    if (progress?.progress >= 100 && !hasTransitioned) {
      onComplete?.();
    }
  }, [progress, hasTransitioned, onComplete]);

  if (error || contextError) {
    return (
      <Card className="bg-primary-medium/50 border-accent-blue/20">
        <CardContent className="p-4">
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error || contextError}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isConnecting) {
    return (
      <Card className="bg-primary-medium/50 border-accent-blue/20">
        <CardContent className="p-4">
          <div className="flex items-center text-accent-blue">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span>Connecting to scan updates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  const getStatusIcon = () => {
    if (progress.progress >= 100) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (progress.status === 'error') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Loader2 className="h-5 w-5 text-accent-blue animate-spin" />;
  };

  return (
    <Card className="bg-primary-medium/50 border-accent-blue/20">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">
              {progress.type === 'spider' ? 'Spider Scan' : 'Active Scan'}
            </CardTitle>
          </div>
          {onClose && progress.progress >= 100 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span className="truncate mr-4">{progress.targetUrl}</span>
            <span>{progress.progress}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
          {previousScan && previousScan.type === 'spider' && progress.type === 'active' && (
            <div className="text-sm text-gray-400 mt-2">
              Spider scan completed at {previousScan.progress}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 