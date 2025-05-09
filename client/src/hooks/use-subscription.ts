import { useState, useEffect } from 'react';
import axios from 'axios';

// Types for subscription data
export interface SubscriptionData {
  tier: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  usage: {
    daily: number;
    monthly: number;
    activeScans: number;
  };
  limits: {
    maxScansPerDay: number;
    maxScansPerMonth: number;
    maxActiveScansConcurrent: number;
    scanDepth: number;
    reportFormats: string[];
    [key: string]: any;
  };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get('/api/subscription');
        setSubscription(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Get the available report formats for the current subscription
  const getAvailableReportFormats = () => {
    if (!subscription) return ['html']; // Default to HTML if subscription not loaded
    return subscription.limits.reportFormats || ['html'];
  };

  // Get the best available report format (preferring PDF > HTML > JSON > XML)
  const getBestAvailableReportFormat = () => {
    const formats = getAvailableReportFormats();
    if (formats.includes('pdf')) return 'pdf';
    if (formats.includes('html')) return 'html';
    if (formats.includes('json')) return 'json';
    if (formats.includes('xml')) return 'xml';
    return 'html'; // Default fallback
  };

  return { 
    subscription, 
    isLoading, 
    error,
    getAvailableReportFormats,
    getBestAvailableReportFormat
  };
}