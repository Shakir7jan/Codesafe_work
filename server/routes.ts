import express from "express";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  startSpiderScan,
  startActiveScan,
  createScanSSEHandler,
  getAllActiveScans,
  getScanProgress,
  getScanDetails
} from "./zapClient";
import { storage } from "./storage";
import { SubscriptionTier, tierLimitsConfig, getTierFeatures } from "./subscriptionTiers";

const router = express.Router();
router.use(bodyParser.json());

// Default user ID for demonstration purposes (should be implemented with proper auth)
const DEFAULT_USER_ID = 1;

/**
 * Example route for checking server health
 */
router.get("/health", (req: Request, res: Response) => {
  res.status(200).send({ status: "Server is running!" });
});

/**
 * Example route to handle user login (existing feature)
 */
router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Handle login logic (this part was already working)
  if (username === "admin" && password === "password") {
    res.status(200).send({ message: "Login successful" });
  } else {
    res.status(401).send({ message: "Invalid credentials" });
  }
});

/**
 * ZAP Spider Scan Route - Now with usage limits
 */
router.post("/zap/spider-scan", async (req: Request, res: Response) => {
  const { url, targetUrl, config = {}, ajax = false, apiImport = null, customPolicy = null, contextAuth = null } = req.body;
  const scanUrl = url || targetUrl;
  const userId = DEFAULT_USER_ID; // In a real app, get this from authentication
  
  if (!scanUrl) {
    return res.status(400).json({ 
      error: "URL is required",
      message: "Please provide a URL to scan"
    });
  }

  try {
    // Get user subscription tier and features
    const subscription = await storage.getUserSubscription(userId);
    const tierLimits = subscription ? tierLimitsConfig[subscription.tier] : null;
    const zapFeatures = tierLimits?.zapFeatures || [];
    
    // Parse contextAuth if it's a string
    let parsedContextAuth = contextAuth;
    if (typeof contextAuth === 'string') {
      try {
        // If contextAuth is a string that appears to use single quotes instead of double quotes
        // (common mistake when manually writing JSON), convert it before parsing
        let contextAuthStr = contextAuth;
        if (contextAuthStr.includes("'")) {
          contextAuthStr = contextAuthStr.replace(/'/g, '"');
          console.log("Converted contextAuth string to proper JSON format");
        }
        
        parsedContextAuth = JSON.parse(contextAuthStr);
        console.log("Successfully parsed contextAuth:", parsedContextAuth);
        
        // Ensure loginRequestData is also properly formatted if present
        if (parsedContextAuth.loginRequestData && typeof parsedContextAuth.loginRequestData === 'string' 
            && parsedContextAuth.loginRequestData.includes("'")) {
          parsedContextAuth.loginRequestData = parsedContextAuth.loginRequestData.replace(/'/g, '"');
          console.log("Fixed loginRequestData format in contextAuth");
        }
      } catch (parseError) {
        console.error("Error parsing contextAuth:", parseError);
        return res.status(400).json({
          error: "Invalid authentication configuration",
          message: "The authentication configuration provided is not valid JSON"
        });
      }
    }
    
    console.log(`User ${userId} with tier ${subscription?.tier} is starting a scan with features:`, {
      ajax,
      apiImport: apiImport ? true : false,
      customPolicy: customPolicy ? true : false,
      contextAuth: parsedContextAuth ? true : false,
      scanDepth: config.depth
    });

    // Feature validation: AJAX Spider
    if (ajax && !zapFeatures.includes('ajaxSpider')) {
      return res.status(403).json({
        error: "Feature not allowed",
        message: "AJAX Spider is not available on your current plan. Please upgrade to use this feature."
      });
    }

    // Feature validation: API Import
    if (apiImport && !zapFeatures.some(f => ['apiImport','swaggerImport','graphqlImport'].includes(f))) {
      return res.status(403).json({
        error: "Feature not allowed",
        message: "API/Swagger Import is not available on your current plan. Please upgrade to use this feature."
      });
    }

    // Feature validation: Custom Scan Policy
    if (customPolicy && !zapFeatures.includes('customScanPolicy')) {
      return res.status(403).json({
        error: "Feature not allowed",
        message: "Custom Scan Policies are not available on your current plan. Please upgrade to use this feature."
      });
    }

    // Feature validation: Context/Auth
    if (parsedContextAuth && !zapFeatures.includes('contextAuth')) {
      return res.status(403).json({
        error: "Feature not allowed",
        message: "Authenticated scans are not available on your current plan. Please upgrade to use this feature."
      });
    }

    // Check if user can start a new scan based on their subscription
    const canStartScan = await storage.canStartNewScan(userId);
    
    if (!canStartScan.allowed) {
      console.log("Usage limit exceeded:", canStartScan.reason);
      return res.status(403).json({ 
        error: "Usage limit exceeded",
        message: canStartScan.reason || "You have reached your subscription's usage limit"
      });
    }
    
    // Validate scan configuration against subscription tier
    const validConfig = await storage.validateScanConfig(userId, config);
    
    if (!validConfig.valid) {
      console.log("Invalid scan configuration:", validConfig.reason);
      return res.status(403).json({
        error: "Invalid scan configuration",
        message: validConfig.reason || "Your subscription tier doesn't support these scan settings"
      });
    }
    
    // Start the scan with all the validated parameters
    const scanConfig = {
      ...config,
      ajax,
      apiImport,
      customPolicy,
      contextAuth: parsedContextAuth
    };
    
    // Log the final scan configuration that will be passed to ZAP
    console.log(`Starting scan with final configuration:`, scanConfig);
    
    // Start the scan
    const scanId = await startSpiderScan(scanUrl, userId, scanConfig);
    
    // Increment scan count
    await storage.incrementScanCount(userId);
    
    res.status(200).json({ 
      scanId, 
      message: `Spider scan started for ${scanUrl}`,
      tier: subscription?.tier,
      features: {
        ajax: ajax && zapFeatures.includes('ajaxSpider'),
        apiImport: apiImport && zapFeatures.some(f => ['apiImport','swaggerImport','graphqlImport'].includes(f)),
        customPolicy: customPolicy && zapFeatures.includes('customScanPolicy'),
        contextAuth: parsedContextAuth && zapFeatures.includes('contextAuth')
      }
    });
  } catch (error) {
    console.error("Failed to start spider scan:", error);
    res.status(500).json({ message: "Failed to start spider scan" });
  }
});

/**
 * ZAP Active Scan Route - Now with usage limits and feature gating
 */
router.post("/zap/active-scan", async (req: Request, res: Response) => {
  const { url, targetUrl, config = {}, customPolicy = null, contextAuth = null } = req.body;
  const scanUrl = url || targetUrl;
  const userId = DEFAULT_USER_ID; // In a real app, get this from authentication
  
  if (!scanUrl) {
    return res.status(400).json({ 
      error: "URL is required",
      message: "Please provide a URL to scan"
    });
  }

  try {
    // Get zapFeatures for this user
    const subscription = await storage.getUserSubscription(userId);
    const tierLimits = subscription ? tierLimitsConfig[subscription.tier] : null;
    const zapFeatures = tierLimits?.zapFeatures || [];

    // Feature gating: Custom Scan Policy
    if (customPolicy) {
      if (!zapFeatures.includes('customScanPolicy')) {
        return res.status(403).json({
          error: "Feature not allowed",
          message: "Custom scan policy is not available on your plan."
        });
      }
      // Call ZAP API to set custom scan policy (placeholder)
      // await zapClient.setCustomScanPolicy(customPolicy);
    }

    // Feature gating: Context/Auth
    if (contextAuth) {
      if (!zapFeatures.includes('contextAuth')) {
        return res.status(403).json({
          error: "Feature not allowed",
          message: "Context/authenticated scans are not available on your plan."
        });
      }
      // Call ZAP API to set context/auth (placeholder)
      // await zapClient.setContextAuth(contextAuth);
    }

    // Check if user can start a new scan based on their subscription
    const canStartScan = await storage.canStartNewScan(userId);
    if (!canStartScan.allowed) {
      return res.status(403).json({ 
        error: "Usage limit exceeded",
        message: canStartScan.reason
      });
    }

    // Validate scan configuration against subscription tier
    const validConfig = await storage.validateScanConfig(userId, config);
    if (!validConfig.valid) {
      return res.status(403).json({
        error: "Invalid scan configuration",
        message: validConfig.reason
      });
    }

    // Start the scan
    const scanId = await startActiveScan(scanUrl, userId, false, config);
    await storage.incrementScanCount(userId);
    res.status(200).json({ scanId, message: `Active scan started for ${scanUrl}` });
  } catch (error) {
    console.error("Failed to start active scan:", error);
    res.status(500).json({ message: "Failed to start active scan" });
  }
});

/**
 * Get progress of a specific scan by scan ID
 */
router.get("/zap/scan-progress/:scanId", (req: Request, res: Response) => {
  const { scanId } = req.params;
  const scanProgress = getScanProgress(scanId);

  if (scanProgress) {
    res.status(200).send(scanProgress);
  } else {
    res.status(404).send({ message: `Scan with ID ${scanId} not found` });
  }
});

/**
 * Get all active scans
 */
router.get("/zap/active-scans", (req: Request, res: Response) => {
  try {
    const activeScans = getAllActiveScans();
    res.status(200).json(activeScans);
  } catch (error) {
    console.error("Failed to get active scans:", error);
    res.status(500).json({ message: "Failed to get active scans" });
  }
});

/**
 * Get scan history for the current user
 */
router.get('/zap/scan-history', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const history = await storage.getScanHistory(
      DEFAULT_USER_ID, 
      limit ? parseInt(limit as string) : undefined
    );

    res.status(200).json(history);
  } catch (error) {
    console.error('Failed to get scan history:', error);
    res.status(500).json({ message: 'Failed to get scan history' });
  }
});

/**
 * Get scan details including results
 */
router.get('/zap/scan/:scanId', async (req: Request, res: Response) => {
  try {
    const { scanId } = req.params;

    if (!scanId) {
      return res.status(400).json({ message: 'Scan ID is required' });
    }

    const scanDetails = await getScanDetails(scanId);

    if (!scanDetails) {
      return res.status(404).json({ message: `Scan with ID ${scanId} not found` });
    }

    res.status(200).json(scanDetails);
  } catch (error) {
    console.error(`Failed to get scan details for ID ${req.params.scanId}:`, error);
    res.status(500).json({ message: 'Failed to get scan details' });
  }
});

/**
 * Generate and download a scan report
 */
router.get("/zap/scan/:scanId/report/:format", async (req: Request, res: Response) => {
  try {
    const { scanId, format } = req.params;
    const userId = DEFAULT_USER_ID;
    
    if (!['html', 'json', 'xml', 'pdf'].includes(format)) {
      return res.status(400).json({ message: "Invalid format. Supported formats: html, json, xml, pdf" });
    }
    
    // Check if the format is allowed for user's subscription tier
    const subscription = await storage.getUserSubscription(userId);
    
    if (!subscription) {
      return res.status(403).json({ message: "No active subscription found" });
    }
    
    const tierLimits = tierLimitsConfig[subscription.tier];
    
    if (!tierLimits.reportFormats.includes(format as any)) {
      return res.status(403).json({ 
        message: `${format.toUpperCase()} reports are not available on your ${subscription.tier} plan`,
        allowedFormats: tierLimits.reportFormats
      });
    }
    
    const reportContent = await storage.generateScanReport(scanId, format as 'html' | 'json' | 'xml');
    
    const contentTypes = {
      html: 'text/html',
      json: 'application/json',
      xml: 'application/xml',
      pdf: 'application/pdf'
    };
    
    res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes]);
    res.setHeader('Content-Disposition', `attachment; filename=scan-report-${scanId}.${format}`);
    res.status(200).send(reportContent);
  } catch (error) {
    console.error("Failed to generate report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
});

/**
 * Server-Sent Events (SSE) for real-time scan progress
 */
router.get("/zap/scan-progress-sse", createScanSSEHandler());

/**
 * Get aggregated dashboard statistics
 */
router.get('/zap/dashboard-stats', async (req: Request, res: Response) => {
  try {
    const userId = DEFAULT_USER_ID;
    const totalScans = await storage.getTotalScans(userId);
    const activeScans = await storage.getActiveScansCount(userId);
    const completedScans = await storage.getCompletedScansCount(userId);
    const failedScans = await storage.getFailedScansCount(userId);
    const vulnerabilities = await storage.getVulnerabilityStats(userId);
    const subscription = await storage.getUserSubscription(userId);
    const tierLimits = await storage.getTierLimits(userId);

    res.status(200).json({
      totalScans,
      activeScans,
      completedScans,
      failedScans,
      totalVulnerabilities: vulnerabilities.total,
      highSeverity: vulnerabilities.high,
      mediumSeverity: vulnerabilities.medium,
      lowSeverity: vulnerabilities.low,
      subscription: {
        tier: subscription?.tier || 'free',
        usage: {
          dailyScans: subscription?.scanCount.daily || 0,
          monthlyScans: subscription?.scanCount.monthly || 0,
          maxDailyScans: tierLimits.maxScansPerDay,
          maxMonthlyScans: tierLimits.maxScansPerMonth,
          maxConcurrentScans: tierLimits.maxActiveScansConcurrent
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

/**
 * Get user's subscription information
 */
router.get('/subscription', async (req: Request, res: Response) => {
  try {
    const userId = DEFAULT_USER_ID;
    const subscription = await storage.getUserSubscription(userId);
    
    if (!subscription) {
      return res.status(404).json({ message: "No subscription found" });
    }
    
    const tierLimits = await storage.getTierLimits(userId);
    
    res.status(200).json({
      tier: subscription.tier,
      isActive: subscription.isActive,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      usage: {
        daily: subscription.scanCount.daily,
        monthly: subscription.scanCount.monthly,
        activeScans: tierLimits.currentUsage.activeScans
      },
      limits: tierLimits
    });
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
});

/**
 * Get available subscription plans
 */
router.get('/subscription/plans', (req: Request, res: Response) => {
  try {
    const plans = Object.keys(tierLimitsConfig).map(tier => {
      return getTierFeatures(tier as SubscriptionTier);
    });
    
    res.status(200).json(plans);
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
});

/**
 * Update user subscription (example endpoint for testing - this would be handled by a payment provider in production)
 */
router.post('/subscription/update', async (req: Request, res: Response) => {
  try {
    const userId = DEFAULT_USER_ID;
    const { tier } = req.body;
    
    console.log(`Updating subscription for user ${userId} to tier "${tier}"`);
    
    if (!tier || !Object.keys(tierLimitsConfig).includes(tier)) {
      console.log(`Invalid tier provided: ${tier}`);
      return res.status(400).json({ message: "Invalid subscription tier" });
    }
    
    // Get current subscription for logging
    const currentSubscription = await storage.getUserSubscription(userId);
    console.log(`Current subscription: ${currentSubscription?.tier || 'none'}`);
    
    const updatedSubscription = await storage.updateSubscription(userId, {
      tier: tier as SubscriptionTier,
      isActive: true,
      startDate: new Date(),
      // In a real app, set endDate based on billing period
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    
    console.log(`Subscription updated successfully to ${tier}`);
    
    res.status(200).json({
      message: `Subscription updated to ${tier} plan`,
      subscription: updatedSubscription,
      tierLimits: tierLimitsConfig[tier as SubscriptionTier]
    });
  } catch (error) {
    console.error('Failed to update subscription:', error);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

/**
 * Example logout route (existing feature)
 */
router.post("/logout", (req: Request, res: Response) => {
  // Clear session or token-based logout logic
  res.status(200).send({ message: "Logged out successfully" });
});

// Export the router to use it in the main app
export default router;
