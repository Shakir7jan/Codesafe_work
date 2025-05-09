import { users, type User, type InsertUser } from "@shared/schema";
import { Subscription, SubscriptionTier, tierLimitsConfig } from "./subscriptionTiers";
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface ZapAlert {
  pluginId: string;
  risk: 'High' | 'Medium' | 'Low' | 'Informational';
  confidence: string;
  url: string;
  name: string;
  description: string;
  solution?: string;
  reference?: string;
  cweid?: string;
  wascid?: string;
  messageId?: string;
  evidence?: string;
}

interface ScanConfig {
  depth?: number;
  scope?: 'full' | 'quick';
  excludeUrls?: string[];
  blackListPlugins?: string[];  // For ignoring specific alert types
}

interface Scan {
  id: string;
  targetUrl: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  type: 'spider' | 'active';
  userId: number;
  progress: number;
  config: ScanConfig;
  contextName?: string;  // Add contextName for authentication contexts
  contextId?: string;    // Store the ZAP contextId for all ZAP API calls
  summary?: {
    total: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createScan(scan: Omit<Scan, 'id'>): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  updateScanProgress(id: string, progress: number): Promise<void>;
  updateScan(id: string, updates: Partial<Scan>): Promise<Scan | undefined>;
  getAllScans(userId: number): Promise<Scan[]>;
  saveScanResults(scanId: string, alerts: ZapAlert[]): Promise<void>;
  getScanResults(scanId: string): Promise<ZapAlert[]>;
  getScanHistory(userId: number, limit?: number): Promise<Scan[]>;
  generateScanReport(scanId: string, format: 'html' | 'json' | 'xml' | 'pdf'): Promise<string>;
  getTotalScans(userId: number): Promise<number>;
  getActiveScansCount(userId: number): Promise<number>;
  getCompletedScansCount(userId: number): Promise<number>;
  getFailedScansCount(userId: number): Promise<number>;
  getVulnerabilityStats(userId: number): Promise<{ total: number; high: number; medium: number; low: number; }>;
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  updateSubscription(userId: number, subscription: Partial<Subscription>): Promise<Subscription>;
  canStartNewScan(userId: number): Promise<{ allowed: boolean; reason?: string }>;
  incrementScanCount(userId: number): Promise<void>;
  resetCounters(): Promise<void>;
  validateScanConfig(userId: number, config: ScanConfig): Promise<{ valid: boolean; reason?: string }>;
  getTierLimits(userId: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scans: Map<string, Scan>;
  private scanResults: Map<string, ZapAlert[]>;
  private subscriptions: Map<number, Subscription>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.scanResults = new Map();
    this.subscriptions = new Map();
    this.currentId = 1;
    
    // Initialize with a default subscription for user 1 (for testing)
    this.subscriptions.set(1, {
      userId: 1,
      tier: 'free',
      startDate: new Date(),
      isActive: true,
      scanCount: {
        daily: 0,
        monthly: 0,
        lastUpdated: new Date()
      }
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createScan(scan: Omit<Scan, 'id'>): Promise<Scan> {
    const id = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newScan: Scan = { ...scan, id };
    this.scans.set(id, newScan);
    return newScan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async updateScanProgress(id: string, progress: number): Promise<void> {
    const scan = this.scans.get(id);
    if (!scan) {
      throw new Error(`Scan with ID ${id} not found`);
    }
    
    scan.progress = progress;
    if (progress >= 100) {
      scan.status = 'completed';
      scan.endTime = new Date();
    }
    this.scans.set(id, scan);
  }

  async updateScan(id: string, updates: Partial<Scan>): Promise<Scan | undefined> {
    const scan = this.scans.get(id);
    if (!scan) {
      return undefined;
    }
    
    const updatedScan = { ...scan, ...updates };
    this.scans.set(id, updatedScan);
    return updatedScan;
  }

  async getAllScans(userId: number): Promise<Scan[]> {
    return Array.from(this.scans.values())
      .filter(scan => scan.userId === userId);
  }

  async saveScanResults(scanId: string, alerts: ZapAlert[]): Promise<void> {
    this.scanResults.set(scanId, alerts);
  }

  async getScanResults(scanId: string): Promise<ZapAlert[]> {
    const results = this.scanResults.get(scanId);
    if (!results) {
      return [];
    }
    return results;
  }

  async getScanHistory(userId: number, limit?: number): Promise<Scan[]> {
    const userScans = Array.from(this.scans.values())
      .filter(scan => scan.userId === userId)
      .sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0));
    
    return limit ? userScans.slice(0, limit) : userScans;
  }

  async generateScanReport(scanId: string, format: 'html' | 'json' | 'xml' | 'pdf'): Promise<string> {
    const scan = await this.getScan(scanId);
    if (!scan) {
      throw new Error(`Scan with ID ${scanId} not found`);
    }

    const alerts = await this.getScanResults(scanId);
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          scan,
          alerts,
          summary: scan.summary,
          generatedAt: new Date().toISOString()
        }, null, 2);
      
      case 'html':
        // Basic HTML report template
        return `
          <html>
            <head><title>Scan Report - ${scan.targetUrl}</title></head>
            <body>
              <h1>Security Scan Report</h1>
              <h2>Target: ${scan.targetUrl}</h2>
              <p>Scan completed: ${scan.endTime?.toLocaleString()}</p>
              <h3>Summary</h3>
              <ul>
                <li>Total Alerts: ${scan.summary?.total || 0}</li>
                <li>High Risk: ${scan.summary?.high || 0}</li>
                <li>Medium Risk: ${scan.summary?.medium || 0}</li>
                <li>Low Risk: ${scan.summary?.low || 0}</li>
              </ul>
              <h3>Alerts</h3>
              ${alerts.map(alert => `
                <div class="alert ${alert.risk.toLowerCase()}">
                  <h4>${alert.name}</h4>
                  <p>Risk: ${alert.risk}</p>
                  <p>URL: ${alert.url}</p>
                  <p>${alert.description}</p>
                  ${alert.solution ? `<p>Solution: ${alert.solution}</p>` : ''}
                </div>
              `).join('\n')}
            </body>
          </html>
        `;
      
      case 'xml':
        // Basic XML report template
        return `<?xml version="1.0" encoding="UTF-8"?>
          <scanReport>
            <target>${scan.targetUrl}</target>
            <scanDate>${scan.endTime?.toISOString()}</scanDate>
            <summary>
              <total>${scan.summary?.total || 0}</total>
              <high>${scan.summary?.high || 0}</high>
              <medium>${scan.summary?.medium || 0}</medium>
              <low>${scan.summary?.low || 0}</low>
            </summary>
            <alerts>
              ${alerts.map(alert => `
                <alert>
                  <n>${alert.name}</n>
                  <risk>${alert.risk}</risk>
                  <url>${alert.url}</url>
                  <description>${alert.description}</description>
                  ${alert.solution ? `<solution>${alert.solution}</solution>` : ''}
                </alert>
              `).join('\n')}
            </alerts>
          </scanReport>`;
      
      case 'pdf':
        // Generate PDF using PDFKit
        return await this.generatePDFReport(scan, alerts);
    }
  }

  private async generatePDFReport(scan: Scan, alerts: ZapAlert[]): Promise<string> {
    const doc = new PDFDocument();
    const stream = new Readable();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      stream.push(Buffer.concat(chunks));
      stream.push(null);
    });

    doc.fontSize(20).text('Security Scan Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Target: ${scan.targetUrl}`);
    doc.text(`Scan completed: ${scan.endTime?.toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(14).text('Summary:');
    doc.text(`Total Alerts: ${scan.summary?.total || 0}`);
    doc.text(`High Risk: ${scan.summary?.high || 0}`);
    doc.text(`Medium Risk: ${scan.summary?.medium || 0}`);
    doc.text(`Low Risk: ${scan.summary?.low || 0}`);
    doc.moveDown();
    doc.fontSize(14).text('Alerts:');
    alerts.forEach(alert => {
      doc.text(`Name: ${alert.name}`);
      doc.text(`Risk: ${alert.risk}`);
      doc.text(`URL: ${alert.url}`);
      doc.text(`Description: ${alert.description}`);
      if (alert.solution) {
        doc.text(`Solution: ${alert.solution}`);
      }
      doc.moveDown();
    });

    doc.end();

    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];
      stream.on('data', data => buffers.push(data));
      stream.on('end', () => resolve(Buffer.concat(buffers).toString('base64')));
      stream.on('error', reject);
    });
  }

  async getTotalScans(userId: number): Promise<number> {
    return Array.from(this.scans.values())
      .filter(scan => scan.userId === userId)
      .length;
  }

  async getActiveScansCount(userId: number): Promise<number> {
    return Array.from(this.scans.values())
      .filter(scan => scan.userId === userId && scan.status === 'running')
      .length;
  }

  async getCompletedScansCount(userId: number): Promise<number> {
    return Array.from(this.scans.values())
      .filter(scan => scan.userId === userId && scan.status === 'completed')
      .length;
  }

  async getFailedScansCount(userId: number): Promise<number> {
    return Array.from(this.scans.values())
      .filter(scan => scan.userId === userId && scan.status === 'failed')
      .length;
  }

  async getVulnerabilityStats(userId: number): Promise<{ total: number; high: number; medium: number; low: number; }> {
    const userScans = Array.from(this.scans.values())
      .filter(scan => scan.userId === userId && scan.status === 'completed');
    
    const stats = {
      total: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    for (const scan of userScans) {
      if (scan.summary) {
        stats.total += scan.summary.total || 0;
        stats.high += scan.summary.high || 0;
        stats.medium += scan.summary.medium || 0;
        stats.low += scan.summary.low || 0;
      }
    }

    return stats;
  }

  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(userId);
  }

  async updateSubscription(userId: number, updates: Partial<Subscription>): Promise<Subscription> {
    const existing = this.subscriptions.get(userId);
    
    if (!existing) {
      // Create a new subscription if one doesn't exist
      const newSubscription: Subscription = {
        userId,
        tier: 'free', // Default tier
        startDate: new Date(),
        isActive: true,
        scanCount: {
          daily: 0,
          monthly: 0,
          lastUpdated: new Date()
        },
        ...updates
      };
      
      this.subscriptions.set(userId, newSubscription);
      return newSubscription;
    }
    
    // Update existing subscription
    const updated = { ...existing, ...updates };
    this.subscriptions.set(userId, updated);
    return updated;
  }

  async canStartNewScan(userId: number): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      return { allowed: false, reason: "No active subscription found" };
    }
    
    if (!subscription.isActive) {
      return { allowed: false, reason: "Subscription is not active" };
    }
    
    const limits = tierLimitsConfig[subscription.tier];
    const activeScansCount = await this.getActiveScansCount(userId);
    
    // Check concurrent scans limit
    if (activeScansCount >= limits.maxActiveScansConcurrent) {
      return { 
        allowed: false, 
        reason: `You can only run ${limits.maxActiveScansConcurrent} concurrent scan(s) on your ${subscription.tier} plan`
      };
    }
    
    // Check daily scan limit
    if (subscription.scanCount.daily >= limits.maxScansPerDay) {
      return { 
        allowed: false, 
        reason: `You've reached your daily limit of ${limits.maxScansPerDay} scan(s)`
      };
    }
    
    // Check monthly scan limit
    if (subscription.scanCount.monthly >= limits.maxScansPerMonth) {
      return { 
        allowed: false, 
        reason: `You've reached your monthly limit of ${limits.maxScansPerMonth} scan(s)`
      };
    }
    
    return { allowed: true };
  }

  async incrementScanCount(userId: number): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return;
    
    // Check if the last updated date is from a different day
    const today = new Date();
    const lastUpdated = subscription.scanCount.lastUpdated;
    
    const isNewDay = 
      today.getDate() !== lastUpdated.getDate() ||
      today.getMonth() !== lastUpdated.getMonth() ||
      today.getFullYear() !== lastUpdated.getFullYear();
    
    // Reset daily counter if it's a new day
    if (isNewDay) {
      subscription.scanCount.daily = 0;
    }
    
    // Check if it's a new month
    const isNewMonth = 
      today.getMonth() !== lastUpdated.getMonth() ||
      today.getFullYear() !== lastUpdated.getFullYear();
    
    // Reset monthly counter if it's a new month
    if (isNewMonth) {
      subscription.scanCount.monthly = 0;
    }
    
    // Increment counters
    subscription.scanCount.daily += 1;
    subscription.scanCount.monthly += 1;
    subscription.scanCount.lastUpdated = today;
    
    // Update subscription
    await this.updateSubscription(userId, subscription);
  }

  async resetCounters(): Promise<void> {
    // This could be called by a cron job to reset counters if needed
    const today = new Date();
    
    for (const [userId, subscription] of this.subscriptions.entries()) {
      const lastUpdated = subscription.scanCount.lastUpdated;
      
      const isNewDay = 
        today.getDate() !== lastUpdated.getDate() ||
        today.getMonth() !== lastUpdated.getMonth() ||
        today.getFullYear() !== lastUpdated.getFullYear();
      
      if (isNewDay) {
        subscription.scanCount.daily = 0;
      }
      
      const isNewMonth = 
        today.getMonth() !== lastUpdated.getMonth() ||
        today.getFullYear() !== lastUpdated.getFullYear();
      
      if (isNewMonth) {
        subscription.scanCount.monthly = 0;
      }
      
      if (isNewDay || isNewMonth) {
        subscription.scanCount.lastUpdated = today;
        this.subscriptions.set(userId, subscription);
      }
    }
  }

  async validateScanConfig(userId: number, config: ScanConfig): Promise<{ valid: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      return { valid: false, reason: "No active subscription found" };
    }
    
    const limits = tierLimitsConfig[subscription.tier];
    
    // Check if advanced options are allowed
    if (config.scope === 'full' && !limits.advancedScanOptions) {
      return { 
        valid: false, 
        reason: "Full scope scans are only available in higher tier plans" 
      };
    }
    
    // Check scan depth limit
    if (config.depth && config.depth > limits.scanDepth) {
      return { 
        valid: false, 
        reason: `Maximum scan depth for ${subscription.tier} tier is ${limits.scanDepth}` 
      };
    }
    
    return { valid: true };
  }

  async getTierLimits(userId: number): Promise<any> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      return tierLimitsConfig.free; // Default to free tier
    }
    
    return {
      ...tierLimitsConfig[subscription.tier],
      // Add usage statistics
      currentUsage: {
        dailyScans: subscription.scanCount.daily,
        monthlyScans: subscription.scanCount.monthly,
        activeScans: await this.getActiveScansCount(userId)
      }
    };
  }
}

export const storage = new MemStorage();
