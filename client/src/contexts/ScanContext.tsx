import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface ScanProgress {
  scanId: string;
  type: 'spider' | 'active';
  status: string;
  progress: number;
  targetUrl: string;
  startTime: Date;
}

interface ScanContextType {
  scanProgress: Map<string, ScanProgress>;
  isConnecting: boolean;
  error: string | null;
}

const ScanContext = createContext<ScanContextType | null>(null);

export function useScanContext() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
}

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [scanProgress, setScanProgress] = useState<Map<string, ScanProgress>>(new Map());
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const sse = new EventSource('/api/zap/scan-progress-sse');
      eventSourceRef.current = sse;

      sse.onopen = () => {
        if (isMountedRef.current) {
          setIsConnecting(false);
          setError(null);
          console.log('SSE connection established in ScanProvider');
        }
      };

      sse.onmessage = (event) => {
        if (!isMountedRef.current) return;

        try {
          const data = JSON.parse(event.data);
          console.log('Received scan update in ScanProvider:', data);
          
          if (Array.isArray(data)) {
            // Initial state
            const newProgressMap = new Map();
            data.forEach(scan => {
              newProgressMap.set(scan.scanId, scan);
            });
            setScanProgress(newProgressMap);
          } else {
            // Progress update
            setScanProgress(prev => new Map(prev).set(data.scanId, data));
          }
        } catch (error) {
          console.error('Error parsing scan update in ScanProvider:', error);
          if (isMountedRef.current) {
            setError('Failed to process scan update');
          }
        }
      };

      sse.onerror = (error) => {
        console.error('SSE Error in ScanProvider:', error);
        if (isMountedRef.current) {
          setError('Failed to connect to scan updates');
          setIsConnecting(true);
        }
        
        // Attempt to reconnect after a delay
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      console.log('Cleaning up SSE connection in ScanProvider');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const value = {
    scanProgress,
    isConnecting,
    error
  };

  return (
    <ScanContext.Provider value={value}>
      {children}
    </ScanContext.Provider>
  );
} 