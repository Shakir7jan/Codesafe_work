import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  totalScans: number;
  activeScans: number;
  completedScans: number;
  failedScans: number;
  totalVulnerabilities: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
}

export interface BaseScan {
  id: string;
  targetUrl: string;
  startTime: string;
  status: 'running' | 'completed' | 'failed';
  type: 'spider' | 'active';
  progress: number;
}

export interface ScanWithSummary extends BaseScan {
  summary?: {
    total: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
}

/**
 * Hook for fetching dashboard statistics
 */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await fetch('/api/zap/dashboard-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
}

/**
 * Hook for fetching recent scans
 */
export function useRecentScans(limit = 5) {
  return useQuery<ScanWithSummary[]>({
    queryKey: ['recentScans', limit],
    queryFn: async () => {
      const response = await fetch(`/api/zap/scan-history?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent scans');
      }
      return response.json();
    },
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Calculate security score based on scan results
 * @param stats Dashboard statistics
 */
export function calculateSecurityScore(stats: DashboardStats): number {
  // Only calculate if we have vulnerabilities
  if (stats.totalScans === 0) {
    return 100;
  }
  
  // Base score is 100
  let score = 100;
  
  // Deduct points based on vulnerability severity
  // High severity: -5 points each
  // Medium severity: -3 points each
  // Low severity: -1 point each
  score -= stats.highSeverity * 5;
  score -= stats.mediumSeverity * 3;
  score -= stats.lowSeverity * 1;
  
  // Ensure score doesn't go below 0
  return Math.max(0, Math.min(100, score));
} 