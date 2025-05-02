import { z } from "zod";

// Subscription tier identifiers
export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';

// Schema for the tier limitations
export interface TierLimits {
  maxActiveScansConcurrent: number;   // Max number of concurrent scans
  maxScansPerDay: number;             // Max number of scans per day
  maxScansPerMonth: number;           // Max number of scans per month
  maxUrlsPerScan: number;             // Max URLs to scan in a single scan
  scanDepth: number;                  // Max crawl depth for spider scans
  advancedScanOptions: boolean;       // Whether advanced scan options are available
  scheduledScans: boolean;            // Whether scheduled scans are allowed
  apiAccess: boolean;                 // Whether API access is available
  reportFormats: Array<'html' | 'pdf' | 'json' | 'xml'>;  // Available report formats
  scanTypes: Array<'spider' | 'active' | 'full'>;         // Available scan types
  retentionPeriodDays: number;        // How long to keep scan results (days)
  supportType: 'none' | 'email' | 'priority';             // Type of support
  zapFeatures?: string[];             // List of ZAP features enabled for this tier
}

// Define the limits for each tier
export const tierLimitsConfig: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxActiveScansConcurrent: 1,
    maxScansPerDay: 2,
    maxScansPerMonth: 10,
    maxUrlsPerScan: 20,
    scanDepth: 2,
    advancedScanOptions: false,
    scheduledScans: false,
    apiAccess: false,
    reportFormats: ['html', 'json'],
    scanTypes: ['spider', 'active'],
    retentionPeriodDays: 7,
    supportType: 'none',
    zapFeatures: [
      'spider',
      'activeScan',
      'basicReport',
    ]
  },
  basic: {
    maxActiveScansConcurrent: 2,
    maxScansPerDay: 5,
    maxScansPerMonth: 30,
    maxUrlsPerScan: 100,
    scanDepth: 3,
    advancedScanOptions: true,
    scheduledScans: false,
    apiAccess: false,
    reportFormats: ['html', 'json', 'xml'],
    scanTypes: ['spider', 'active', 'full'],
    retentionPeriodDays: 30,
    supportType: 'email',
    zapFeatures: [
      'spider',
      'activeScan',
      'ajaxSpider',
      'customScanDepth',
      'basicReport',
      'xmlReport',
    ]
  },
  professional: {
    maxActiveScansConcurrent: 5,
    maxScansPerDay: 15,
    maxScansPerMonth: 100,
    maxUrlsPerScan: 500,
    scanDepth: 5,
    advancedScanOptions: true,
    scheduledScans: true,
    apiAccess: true,
    reportFormats: ['html', 'pdf', 'json', 'xml'],
    scanTypes: ['spider', 'active', 'full'],
    retentionPeriodDays: 90,
    supportType: 'email',
    zapFeatures: [
      'spider',
      'activeScan',
      'ajaxSpider',
      'customScanDepth',
      'customScanPolicy',
      'scheduledScans',
      'advancedReport',
      'xmlReport',
      'pdfReport',
    ]
  },
  enterprise: {
    maxActiveScansConcurrent: 10,
    maxScansPerDay: 50,
    maxScansPerMonth: 500,
    maxUrlsPerScan: 1000,
    scanDepth: 10,
    advancedScanOptions: true,
    scheduledScans: true,
    apiAccess: true,
    reportFormats: ['html', 'pdf', 'json', 'xml'],
    scanTypes: ['spider', 'active', 'full'],
    retentionPeriodDays: 365,
    supportType: 'priority',
    zapFeatures: [
      'spider',
      'activeScan',
      'ajaxSpider',
      'customScanDepth',
      'customScanPolicy',
      'scheduledScans',
      'apiImport',
      'swaggerImport',
      'graphqlImport',
      'contextAuth',
      'advancedReport',
      'xmlReport',
      'pdfReport',
    ]
  }
};

// Subscription validator schema
export const subscriptionSchema = z.object({
  userId: z.number(),
  tier: z.enum(['free', 'basic', 'professional', 'enterprise']),
  startDate: z.date(),
  endDate: z.date().optional(),
  isActive: z.boolean(),
  scanCount: z.object({
    daily: z.number().default(0),
    monthly: z.number().default(0),
    lastUpdated: z.date()
  })
});

export type Subscription = z.infer<typeof subscriptionSchema>;

// Helper to get the limits for a specific tier
export const getLimitsForTier = (tier: SubscriptionTier): TierLimits => {
  return tierLimitsConfig[tier];
};

// Get tier features to display in the UI
export const getTierFeatures = (tier: SubscriptionTier) => {
  const limits = tierLimitsConfig[tier];
  return {
    tier,
    features: [
      `${limits.maxScansPerMonth} scans per month`,
      `${limits.maxScansPerDay} scans per day`,
      `${limits.maxActiveScansConcurrent} concurrent scans`,
      `Scan depth up to ${limits.scanDepth} levels`,
      `${limits.maxUrlsPerScan} URLs per scan`,
      limits.advancedScanOptions ? 'Advanced scan options' : 'Basic scan options',
      limits.scheduledScans ? 'Scheduled scans' : 'Manual scans only',
      limits.apiAccess ? 'API access' : 'No API access',
      `${limits.retentionPeriodDays} days data retention`,
      `${limits.supportType === 'none' ? 'No' : limits.supportType} support`,
    ],
    zapFeatures: limits.zapFeatures || []
  };
};