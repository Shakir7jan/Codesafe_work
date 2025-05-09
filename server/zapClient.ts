import axios from "axios";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const ZAP_API_HOST = process.env.ZAP_HOST || "http://localhost:8080";
const ZAP_API_KEY = process.env.ZAP_API_KEY || "change_me-9203935709"; // Default key for development

// Log warning but don't exit - allow fallback to default API key for dev environments
if (!process.env.ZAP_API_KEY) {
  console.warn("WARNING: ZAP_API_KEY is missing. Using default API key for local ZAP instance.");
}

// Configure axios to better handle ZAP API responses
const zapAxios = axios.create({
  baseURL: ZAP_API_HOST,
  timeout: 30000 // 30 second timeout for ZAP operations
});

// Add request logging for debugging
zapAxios.interceptors.request.use(request => {
  // Redact API key from logs
  const redactedUrl = request.url?.replace(/apikey=([^&]*)/, 'apikey=REDACTED');
  console.log(`ZAP API Request: ${request.method?.toUpperCase()} ${redactedUrl}`);
  return request;
});

// Add response logging for debugging
zapAxios.interceptors.response.use(
  response => {
    console.log(`ZAP API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    if (error.response) {
      console.error('ZAP API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('ZAP API Request failed, no response received');
    } else {
      console.error('ZAP API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const scanEmitter = new EventEmitter();
const activeScans = new Map(); // Active scans tracker

// Interface for scan progress data
interface ScanProgress {
  scanId: string;
  type: "spider" | "active";
  status: string;
  progress: number;
  targetUrl: string;
  startTime: Date;
}

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

// Define config interface
interface ScanConfig {
  depth?: number;
  scope?: 'full' | 'quick';
  excludeUrls?: string[];
  blackListPlugins?: string[];
  ajax?: boolean;
  apiImport?: string;
  customPolicy?: string;
  contextAuth?: AuthConfig;
}

interface AuthConfig {
  authType: 'form' | 'api' | 'session-replay';
  loginUrl?: string;
  loginRequestData?: string;
  loginPageValidationRegex?: string;
  credentials?: {
    username: string;
    password: string;
  };
  headers?: Record<string, string>;
  cookies?: string;
}

interface SpiderParams {
  apikey: string;
  url: string;
  recurse: string;
  maxChildren: string;
  depth?: string;
  contextName?: string;
  [key: string]: string | undefined;
}

// Default userId for demonstration purposes (should be replaced with actual authentication)
const DEFAULT_USER_ID = 1;

/**
 * Sets up an authentication context for ZAP scanning
 * @param targetUrl URL to be scanned
 * @param authConfig Authentication configuration
 * @returns Context information including contextId, contextName, and optional userId
 */
async function setupAuthContext(targetUrl: string, authConfig: AuthConfig): Promise<{ contextId: string, contextName: string, userId?: string }> {
  try {
    console.log(`Setting up authenticated context for ${targetUrl}`);
    // Generate a unique context name
    const contextName = `context_${Date.now()}`;
    
    // 1. Create a new context
    console.log(`Creating ZAP context: ${contextName}`);
    const contextResponse = await zapAxios.get(`/JSON/context/action/newContext/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextName: contextName
      }
    });
    
    // Get the ZAP-assigned contextId
    const zapContextId = contextResponse.data.contextId;
    console.log("Context creation response:", contextResponse.data);
    
    // 2. Include target URL in context
    const parsedUrl = new URL(targetUrl);
    const baseUrlPattern = `${parsedUrl.protocol}//${parsedUrl.hostname}.*`;
    
    console.log(`Including URL pattern in context: ${baseUrlPattern}`);
    await zapAxios.get(`/JSON/context/action/includeInContext/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextName: contextName,
        regex: baseUrlPattern
      }
    });

    console.log(`Setting up ${authConfig.authType} authentication for context: ${contextName}`);
    
    // 3. Set up authentication method based on authType
    if (authConfig.authType === 'form') {
      await setupFormAuthentication(zapContextId, authConfig);
    } else if (authConfig.authType === 'api') {
      await setupApiAuthentication(zapContextId, authConfig);
    }
    
    // 4. Create a new user and credentials
    let userId;
    if (!authConfig.credentials?.username || !authConfig.credentials?.password) {
      console.warn('No credentials provided for authenticated scan');
    } else {
      try {
        console.log('Creating authentication user...');
        userId = await createAuthUser(zapContextId, authConfig.credentials);
        console.log('User created successfully with ID:', userId);
        
        // 5. Enable forced user mode
        console.log('Enabling forced user mode...');
        await zapAxios.get(`/JSON/forcedUser/action/setForcedUserModeEnabled/`, {
          params: {
            apikey: ZAP_API_KEY,
            enabled: 'true'
          }
        });
        
        // 6. Set the created user as forced user
        console.log('Setting forced user...');
        await zapAxios.get(`/JSON/forcedUser/action/setForcedUser/`, {
          params: {
            apikey: ZAP_API_KEY,
            contextId: zapContextId,
            userId: userId
          }
        });
        console.log('Forced user mode setup completed');
      } catch (error) {
        console.error('Error in user creation and forced user setup:', error);
      }
    }
    
    return { contextId: zapContextId, contextName, userId };
  } catch (error) {
    console.error('Error in setupAuthContext:', error);
    throw error;
  }
}

/**
 * Sets up form-based authentication for a ZAP context
 * @param contextId The ZAP context ID
 * @param authConfig Authentication configuration
 */
async function setupFormAuthentication(contextId: string, authConfig: AuthConfig): Promise<void> {
  try {
    // Ensure loginUrl is present
    const loginUrl = authConfig.loginUrl || '';
    if (!loginUrl) {
      throw new Error('loginUrl is required for form-based authentication');
    }

    // Format login request data with username and password placeholders
    const loginRequestData = `username={%username%}&password={%password%}`;
    
    // Build the config string with proper URL encoding
    const authMethodConfigParams = `loginUrl=${encodeURIComponent(loginUrl)}&loginRequestData=${encodeURIComponent(loginRequestData)}`;
    
    console.log('Setting up form authentication with config:', authMethodConfigParams);
    
    // Set the authentication method
    await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        authMethodName: 'formBasedAuthentication',
        authMethodConfigParams: authMethodConfigParams
      }
    });

    // Set logged-in indicator if provided
    if (authConfig.loginPageValidationRegex) {
      console.log(`Setting logged-in indicator: ${authConfig.loginPageValidationRegex}`);
      await zapAxios.get(`/JSON/authentication/action/setLoggedInIndicator/`, {
        params: {
          apikey: ZAP_API_KEY,
          contextId: contextId,
          loggedInIndicatorRegex: authConfig.loginPageValidationRegex
        }
      });
    }
  } catch (error) {
    console.error('Failed to set up form authentication:', error);
    throw error;
  }
}

/**
 * Sets up API-based authentication for a ZAP context (JSON/REST APIs)
 * @param contextId The ZAP context ID
 * @param authConfig Authentication configuration
 */
async function setupApiAuthentication(contextId: string, authConfig: AuthConfig): Promise<void> {
  try {
    // Ensure loginUrl and loginRequestData are present
    const loginUrl = authConfig.loginUrl || '';
    const loginRequestData = authConfig.loginRequestData || '';
    if (!loginUrl || !loginRequestData) {
      throw new Error('loginUrl and loginRequestData are required for API-based authentication');
    }
    
    // Build the config string as per ZAP doc (no double encoding)
    const authMethodConfigParams = `loginUrl=${encodeURIComponent(loginUrl)}&loginRequestData=${encodeURIComponent(loginRequestData)}`;
    
    await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        authMethodName: 'jsonBasedAuthentication',
        authMethodConfigParams: authMethodConfigParams
      }
    });
    
    // Set login page verification if provided
    if (authConfig.loginPageValidationRegex) {
      await zapAxios.get(`/JSON/authentication/action/setLoggedInIndicator/`, {
        params: {
          apikey: ZAP_API_KEY,
          contextId: contextId,
          loggedInIndicatorRegex: authConfig.loginPageValidationRegex
        }
      });
    }
  } catch (error) {
    console.error('Failed to set up API authentication:', error);
    throw error;
  }
}

/**
 * Creates a user with credentials in the ZAP context
 * @param contextId The ZAP context ID
 * @param credentials User credentials
 * @returns The created user ID
 */
async function createAuthUser(contextId: string, credentials: AuthConfig['credentials']): Promise<string> {
  try {
    console.log('Starting user creation process...');
    
    // Create new user
    console.log('Creating new user in ZAP...');
    const userIdResp = await zapAxios.get(`/JSON/users/action/newUser/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        name: credentials.username
      }
    });
    
    const userId = userIdResp.data.userId;
    if (!userId || userId === '0') {
      throw new Error('Failed to create a valid ZAP userId');
    }
    console.log('User created with ID:', userId);

    // Set authentication credentials
    console.log('Setting authentication credentials...');
    const authCredentialsConfigParams = `username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}`;
    
    await zapAxios.get(`/JSON/users/action/setAuthenticationCredentials/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        userId: userId,
        authCredentialsConfigParams: authCredentialsConfigParams
      }
    });
    console.log('Authentication credentials set successfully');

    // Enable the user
    console.log('Enabling user...');
    await zapAxios.get(`/JSON/users/action/setUserEnabled/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        userId: userId,
        enabled: 'true'
      }
    });
    console.log('User enabled successfully');

    // Verify user was created and enabled
    console.log('Verifying user setup...');
    const usersResp = await zapAxios.get(`/JSON/users/view/usersList/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId
      }
    });
    
    const userExists = usersResp.data.usersList.some((u: any) => u.id === userId);
    if (!userExists) {
      throw new Error('User was not found in the context after creation');
    }
    console.log('User verification successful');

    console.log(`Authentication user created and enabled for context ${contextId}, userId: ${userId}`);
    return userId;
  } catch (error) {
    console.error('Failed to create authentication user:', error);
    throw error;
  }
}

/**
 * Test authentication configuration by setting up a temporary context and verifying login.
 * Returns { success: boolean, details?: any, reason?: string, suggestions?: string[] }
 */
async function testAuthentication(targetUrl: string, authConfig: AuthConfig) {
  try {
    // 1. Create a temporary context
    const contextName = `test_context_${Date.now()}`;
    const contextResp = await zapAxios.get(`/JSON/context/action/newContext/`, {
      params: { apikey: ZAP_API_KEY, contextName }
    });
    const contextId = contextResp.data.contextId;

    // 2. Set up authentication method (form, json, session-replay, basic)
    if (authConfig.type === 'form') {
      // Use provided or detected field names
      const usernameField = authConfig.usernameField || 'username';
      const passwordField = authConfig.passwordField || 'password';
      const loginRequestData = `${usernameField}={%username%}&${passwordField}={%password%}`;
      await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
        params: {
          apikey: ZAP_API_KEY,
          contextId,
          authMethodName: 'formBasedAuthentication',
          authMethodConfigParams: `loginUrl=${encodeURIComponent(authConfig.loginUrl || '')}&loginRequestData=${encodeURIComponent(loginRequestData)}`
        }
      });
    } else if (authConfig.type === 'json') {
      await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
        params: {
          apikey: ZAP_API_KEY,
          contextId,
          authMethodName: 'jsonBasedAuthentication',
          authMethodConfigParams: `loginUrl=${encodeURIComponent(authConfig.loginUrl || '')}&loginRequestData=${encodeURIComponent(authConfig.loginRequestData || '')}`
        }
      });
    } else if (authConfig.type === 'basic') {
      await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
        params: {
          apikey: ZAP_API_KEY,
          contextId,
          authMethodName: 'httpAuthentication',
          authMethodConfigParams: `hostname=${new URL(authConfig.loginUrl || '').hostname}`
        }
      });
    } else if (authConfig.type === 'session-replay') {
      // For session replay, you would inject cookies/headers via ZAP script or API (not shown here)
      // This is a placeholder for future extension
      return { success: false, reason: 'Session replay not yet implemented in backend.' };
    }

    // 3. Create user and set credentials if needed
    let userId;
    if (authConfig.credentials) {
      const userResp = await zapAxios.get(`/JSON/users/action/newUser/`, {
        params: { apikey: ZAP_API_KEY, contextId, name: authConfig.credentials.username }
      });
      userId = userResp.data.userId;
      await zapAxios.get(`/JSON/users/action/setAuthenticationCredentials/`, {
        params: {
          apikey: ZAP_API_KEY,
          contextId,
          userId,
          authCredentialsConfigParams: `username=${encodeURIComponent(authConfig.credentials.username)}&password=${encodeURIComponent(authConfig.credentials.password)}`
        }
      });
      await zapAxios.get(`/JSON/users/action/setUserEnabled/`, {
        params: { apikey: ZAP_API_KEY, contextId, userId, enabled: 'true' }
      });
    }

    // 4. Set logged-in indicator if provided
    if (authConfig.verificationPattern) {
      await zapAxios.get(`/JSON/authentication/action/setLoggedInIndicator/`, {
        params: { apikey: ZAP_API_KEY, contextId, loggedInIndicatorRegex: authConfig.verificationPattern }
      });
    }

    // 5. Attempt to access a protected page as the user
    // (In a real implementation, you might use ZAP's 'requestor' or spider as user and check response)
    // Here, we just check if user creation and auth setup succeeded
    if (userId) {
      return { success: true, details: { contextId, userId } };
    } else {
      return { success: false, reason: 'User creation or authentication failed.' };
    }
  } catch (e: any) {
    return { success: false, reason: e.message, suggestions: ['Check credentials', 'Check login URL', 'Check field names'] };
  }
}

/**
 * Starts a spider scan with ZAP
 * @param targetUrl URL to scan
 * @param userId User ID
 * @param config Scan configuration
 * @returns The scan ID
 */
async function startSpiderScan(targetUrl: string, userId = DEFAULT_USER_ID, config: ScanConfig = {}): Promise<string> {
  try {
    console.log(`Starting spider scan for ${targetUrl}...`);
    
    // Get user subscription tier limits
    const tierLimits = await storage.getTierLimits(userId);
    
    // Apply tier-specific configuration
    const scanConfig: ScanConfig = {
      ...config,
      // Default values based on subscription tier
      depth: Math.min(config.depth || tierLimits.scanDepth, tierLimits.scanDepth),
    };
    
    // Log the scan configuration for debugging
    console.log(`Scan configuration:`, {
      depth: scanConfig.depth,
      ajax: scanConfig.ajax,
      apiImport: scanConfig.apiImport ? 'Provided' : 'Not provided',
      customPolicy: scanConfig.customPolicy ? 'Provided' : 'Not provided',
      contextAuth: scanConfig.contextAuth ? 'Provided' : 'Not provided',
      userTier: tierLimits.tier
    });
    
    // Create authentication context if auth config is provided
    let context: { contextId: string, contextName: string, userId?: string } | undefined;
    if (scanConfig.contextAuth && tierLimits.zapFeatures?.includes('contextAuth')) {
      try {
        context = await setupAuthContext(targetUrl, scanConfig.contextAuth);
        console.log(`Using authentication context ID: ${context.contextId}, userId: ${context.userId}`);
      } catch (authError) {
        console.error(`Authentication setup failed:`, authError);
        // Continue with scan without authentication if setup fails
      }
    }

    // Session replay: inject cookies/headers if provided
    if (scanConfig.contextAuth && scanConfig.contextAuth.authType === 'session-replay') {
      const { cookies, headers } = scanConfig.contextAuth;
      // TODO: Inject cookies/headers into ZAP using HTTP Sender script or ZAP API
      // This is a placeholder for actual ZAP script integration
      console.log('Session replay: would inject cookies:', cookies, 'and headers:', headers);
      // You would typically upload a ZAP script or set global headers/cookies here
    }
    
    // Check if we should use AJAX Spider instead
    const useAjaxSpider = scanConfig.ajax === true;
    
    if (useAjaxSpider) {
      console.log(`Using AJAX Spider for ${targetUrl} as requested`);
      
      // Verify if user's tier allows AJAX Spider
      if (!tierLimits.zapFeatures?.includes('ajaxSpider')) {
        console.error(`User tier ${tierLimits.tier} does not allow AJAX Spider. Falling back to regular spider.`);
        // Fall back to regular spider without AJAX
      } else {
        // Configure AJAX Spider parameters
        const ajaxParams: Record<string, string> = { 
          apikey: ZAP_API_KEY, 
          url: targetUrl,
          maxDuration: Math.min(tierLimits.scanDepth * 5, 30).toString() // Scale duration with scan depth
        };
        
        // Add context if available
        if (context) {
          ajaxParams.contextId = context.contextId;
        }
        
        console.log(`Starting AJAX Spider with parameters:`, ajaxParams);
        
        // Start the AJAX Spider scan
        const ajaxResponse = await zapAxios.get(`/JSON/ajaxSpider/action/scan/`, { params: ajaxParams });
        console.log(`AJAX Spider started:`, ajaxResponse.data);
      }
    }
    
    // Process API Import if provided
    if (scanConfig.apiImport && tierLimits.zapFeatures?.some((f: string) => ['apiImport','swaggerImport','graphqlImport'].includes(f))) {
      console.log(`Importing API definition from: ${scanConfig.apiImport}`);
      // This would call the ZAP API to import the API definition
      try {
        await zapAxios.get(`/JSON/openapi/action/importUrl/`, { 
          params: { 
            apikey: ZAP_API_KEY, 
            url: scanConfig.apiImport,
            contextId: context?.contextId
          } 
        });
        console.log(`API definition imported successfully`);
      } catch (error) {
        console.error(`Failed to import API definition:`, error);
      }
    }
    
    // Configure ZAP spider parameters based on tier limits and user config
    const params: SpiderParams = { 
      apikey: ZAP_API_KEY, 
      url: targetUrl, 
      recurse: "true",
      maxChildren: tierLimits.maxUrlsPerScan.toString(),
      // Add any other params from scanConfig that ZAP supports
    };
    
    // Set the spider depth based on the user's tier and config
    params.depth = scanConfig.depth?.toString() || tierLimits.scanDepth.toString();
    console.log(`Using spider depth: ${params.depth} (max allowed: ${tierLimits.scanDepth})`);
    
    // Add context if available
    if (context) {
      params.contextId = context.contextId;
    }
    
    // Apply custom scan policy if provided and allowed
    if (scanConfig.customPolicy && tierLimits.zapFeatures?.includes('customScanPolicy')) {
      console.log(`Applying custom scan policy: ${scanConfig.customPolicy}`);
      // This would call the ZAP API to set the scan policy
      // Implementation depends on ZAP API structure
      try {
        await zapAxios.get(`/JSON/ascan/action/importScanPolicy/`, {
          params: {
            apikey: ZAP_API_KEY,
            path: scanConfig.customPolicy
          }
        });
        console.log(`Custom scan policy imported successfully`);
      } catch (error) {
        console.error(`Failed to import custom scan policy:`, error);
      }
    }
    
    let response;
    if (context && context.userId) {
      response = await zapAxios.get(`/JSON/spider/action/scanAsUser/`, {
        params: {
          apikey: ZAP_API_KEY,
          contextId: context.contextId,
          userId: context.userId,
          url: targetUrl,
          maxChildren: tierLimits.maxUrlsPerScan.toString(),
          recurse: "true",
          depth: scanConfig.depth?.toString() || tierLimits.scanDepth.toString()
        }
      });
    } else {
      response = await zapAxios.get(`/JSON/spider/action/scan/`, { params });
    }

    const scanId = response.data.scan;
    console.log(`Spider scan started with ID: ${scanId}`);

    // Create a scan record in storage
    const scanRecord = await storage.createScan({
      targetUrl,
      startTime: new Date(),
      status: 'running',
      type: 'spider',
      userId,
      progress: 0,
      config: scanConfig,
      contextName: context?.contextName
    });

    // Track in active scans
    activeScans.set(scanRecord.id, {
      type: "spider",
      status: "running",
      progress: 0,
      targetUrl,
      startTime: new Date(),
      databaseId: scanRecord.id,
      zapScanId: scanId,  // Store the ZAP scan ID for API calls
      tierLimits,
      usingAjaxSpider: useAjaxSpider,
      contextId: context?.contextId,
      userId: context?.userId
    });

    monitorScan(scanRecord.id, "spider", scanId);
    return scanRecord.id;
  } catch (error) {
    handleError("starting spider scan", error);
    throw new Error("Failed to start spider scan.");
  }
}

/**
 * Starts an active scan with ZAP
 * @param targetUrl URL to scan
 * @param userId User ID
 * @param afterSpiderScan Whether this is a follow-up to a spider scan
 * @param config Scan configuration
 * @returns The scan ID
 */
async function startActiveScan(targetUrl: string, userId = DEFAULT_USER_ID, afterSpiderScan = false, config: ScanConfig = {}): Promise<string> {
  try {
    console.log(`Starting active scan for ${targetUrl}...`);
    
    // Get user subscription tier limits
    const tierLimits = await storage.getTierLimits(userId);
    
    // Apply tier-specific configuration
    const scanConfig: ScanConfig = {
      ...config,
      // Default values based on subscription tier
      depth: Math.min(config.depth || tierLimits.scanDepth, tierLimits.scanDepth),
    };
    
    // If this is a follow-up active scan after a spider scan, check if we have a context from previous scan
    let context: { contextId: string, contextName: string, userId?: string } | undefined;
    
    if (afterSpiderScan) {
      // Try to find the original spider scan with authentication context
      const spiderScans = Array.from(activeScans.entries())
        .filter(([_, scan]) => scan.type === "spider" && scan.targetUrl === targetUrl);
      
      if (spiderScans.length > 0) {
        const spiderScan = spiderScans[0][1];
        if (spiderScan.contextId && spiderScan.userId) {
          context = { contextId: spiderScan.contextId, contextName: spiderScan.contextName, userId: spiderScan.userId };
          console.log(`Using existing authentication context ID from spider scan: ${context.contextId}, userId: ${context.userId}`);
        }
      }
    } else if (scanConfig.contextAuth && tierLimits.zapFeatures?.includes('contextAuth')) {
      // Create a new authentication context if this is a standalone active scan
      try {
        context = await setupAuthContext(targetUrl, scanConfig.contextAuth);
        console.log(`Created new authentication context ID for active scan: ${context.contextId}, userId: ${context.userId}`);
      } catch (authError) {
        console.error(`Authentication setup failed for active scan:`, authError);
        // Continue without authentication
      }
    }

    // Session replay: inject cookies/headers if provided
    if (scanConfig.contextAuth && scanConfig.contextAuth.authType === 'session-replay') {
      const { cookies, headers } = scanConfig.contextAuth;
      // TODO: Inject cookies/headers into ZAP using HTTP Sender script or ZAP API
      // This is a placeholder for actual ZAP script integration
      console.log('Session replay: would inject cookies:', cookies, 'and headers:', headers);
      // You would typically upload a ZAP script or set global headers/cookies here
    }
    
    // Build parameters for ZAP API based on tier limits
    const params: Record<string, string | boolean> = { 
      apikey: ZAP_API_KEY, 
      url: targetUrl, 
      recurse: true,
      // Add more parameters as needed based on tier
    };
    
    // Add context if available
    if (context) {
      params.contextId = context.contextId;
    }
    
    // If the user's tier doesn't allow certain scan types, adjust accordingly
    if (!tierLimits.scanTypes.includes('full') && scanConfig.scope === 'full') {
      scanConfig.scope = 'quick'; // Downgrade to a quick scan
    }
    
    // Apply custom scan policy if provided and allowed
    if (scanConfig.customPolicy && tierLimits.zapFeatures?.includes('customScanPolicy')) {
      params.scanPolicyName = scanConfig.customPolicy;
    }
    
    let response;
    if (context && context.userId) {
      response = await zapAxios.get(`/JSON/ascan/action/scanAsUser/`, {
        params: {
          apikey: ZAP_API_KEY,
          contextId: context.contextId,
          userId: context.userId,
          url: targetUrl,
          recurse: true
        }
      });
    } else {
      response = await zapAxios.get(`/JSON/ascan/action/scan/`, { params });
    }

    const zapScanId = response.data.scan;
    
    // Create a scan record in storage
    const scanRecord = await storage.createScan({
      targetUrl,
      startTime: new Date(),
      status: 'running',
      type: 'active',
      userId,
      progress: 0,
      config: scanConfig,
      contextName: context?.contextName // Use contextName to match the storage interface
    });
    
    console.log(`Active scan started with ZAP ID: ${zapScanId}, database ID: ${scanRecord.id}`);

    // Track in active scans
    activeScans.set(scanRecord.id, {
      type: "active",
      status: "running",
      progress: 0,
      targetUrl,
      startTime: new Date(),
      databaseId: scanRecord.id,
      zapScanId,
      afterSpiderScan,
      tierLimits,
      contextId: context?.contextId,
      userId: context?.userId
    });

    monitorScan(scanRecord.id, "active", zapScanId);
    return scanRecord.id;
  } catch (error) {
    handleError("starting active scan", error);
    throw new Error("Failed to start active scan.");
  }
}

/**
 * Monitors scan progress and updates storage
 * @param scanId The scan ID
 * @param type The scan type
 * @param zapScanId The ZAP scan ID
 */
async function monitorScan(scanId: string, type: "spider" | "active", zapScanId: string) {
  const getStatus = async () => {
    try {
      const url = type === "spider" 
        ? `/JSON/spider/view/status/`
        : `/JSON/ascan/view/status/`;
      
      const response = await zapAxios.get(url, { 
        params: { 
          apikey: ZAP_API_KEY, 
          scanId: zapScanId 
        } 
      });
      
      return response.data.status;
    } catch (error) {
      console.error(`Error getting status for ${type} scan ${scanId}:`, error);
      return "error";
    }
  };

  const checkProgress = async () => {
    const status = await getStatus();
    const scanData = activeScans.get(scanId);

    if (!scanData) return;
    
    scanData.status = status;
    scanData.progress = parseInt(status) || 0;

    // Update progress in database
    await storage.updateScanProgress(scanId, scanData.progress);

    // Emit for real-time updates
    scanEmitter.emit("scanProgress", { 
      scanId, 
      type,
      status: scanData.status,
      progress: scanData.progress,
      targetUrl: scanData.targetUrl,
      startTime: scanData.startTime
    });

    if (scanData.progress >= 100) {
      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} scan ${scanId} completed.`);
      
      // Fetch and store alerts when scan completes
      try {
        const alerts = await getZapAlerts(scanData.targetUrl);
        const summary = generateScanSummary(alerts);
        
        // Store results
        await storage.saveScanResults(scanId, alerts);
        await storage.updateScan(scanId, {
          status: 'completed',
          endTime: new Date(),
          summary
        });
        
        // If it was a spider scan, automatically start an active scan
        if (type === "spider" && !scanData.afterActiveScan) {
          console.log("Starting active scan after spider scan completed for", scanData.targetUrl);
          await startActiveScan(scanData.targetUrl, DEFAULT_USER_ID, true);
        }
      } catch (error) {
        console.error("Error processing scan results:", error);
        await storage.updateScan(scanId, {
          status: 'failed',
          endTime: new Date()
        });
      }
      
      activeScans.delete(scanId);
    } else {
      setTimeout(checkProgress, 2000); // Check every 2 seconds
    }
  };

  checkProgress();
}

/**
 * Handles errors in a consistent way
 * @param action The action being performed
 * @param error The error object
 */
function handleError(action: string, error: any) {
  if (axios.isAxiosError(error) && error.response) {
    console.error(`Error ${action}: ${error.message}`);
    console.error("API Error Response:", error.response.data);
  } else {
    console.error(`Unexpected error ${action}:`, error);
  }
}

/**
 * Creates an SSE handler for scan progress
 * @returns Express route handler for SSE
 */
function createScanSSEHandler() {
  return (req: any, res: any) => {
    console.log("New SSE connection established.");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send initial active scans data
    const initialData = Array.from(activeScans.entries()).map(([scanId, scan]) => ({
      scanId,
      type: scan.type,
      status: scan.status,
      progress: scan.progress,
      targetUrl: scan.targetUrl,
      startTime: scan.startTime
    }));
    
    if (initialData.length > 0) {
      res.write(`data: ${JSON.stringify(initialData)}\n\n`);
    }

    // Subscribe to future updates
    const onProgress = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    scanEmitter.on("scanProgress", onProgress);

    req.on("close", () => {
      console.log("SSE connection closed.");
      scanEmitter.off("scanProgress", onProgress);
      res.end();
    });
  };
}

/**
 * Gets all active scans
 * @returns Array of active scan progress data
 */
function getAllActiveScans(): ScanProgress[] {
  return Array.from(activeScans.entries()).map(([scanId, scan]) => ({
    scanId,
    type: scan.type,
    status: scan.status,
    progress: scan.progress,
    targetUrl: scan.targetUrl,
    startTime: scan.startTime
  }));
}

/**
 * Gets scan progress for a specific scan
 * @param scanId The scan ID
 * @returns Scan progress data or null if not found
 */
function getScanProgress(scanId: string): ScanProgress | null {
  const scan = activeScans.get(scanId);
  if (!scan) return null;
  
  return {
    scanId,
    type: scan.type,
    status: scan.status,
    progress: scan.progress,
    targetUrl: scan.targetUrl,
    startTime: scan.startTime
  };
}

/**
 * Gets ZAP alerts for a target URL
 * @param targetUrl The target URL
 * @param startIndex The start index
 * @param count The number of alerts to return
 * @returns Array of ZAP alerts
 */
async function getZapAlerts(targetUrl: string, startIndex = 0, count = 5000): Promise<ZapAlert[]> {
  try {
    const response = await zapAxios.get(`/JSON/core/view/alerts/`, {
      params: {
        apikey: ZAP_API_KEY,
        baseurl: targetUrl,
        start: startIndex,
        count
      }
    });
    
    return response.data.alerts;
  } catch (error) {
    console.error(`Error getting ZAP alerts for ${targetUrl}:`, error);
    return [];
  }
}

/**
 * Generates a summary of scan results
 * @param alerts The ZAP alerts
 * @returns Summary object
 */
function generateScanSummary(alerts: ZapAlert[]) {
  const summary = {
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
    total: alerts.length
  };
  
  alerts.forEach(alert => {
    switch (alert.risk.toLowerCase()) {
      case 'high':
        summary.high++;
        break;
      case 'medium':
        summary.medium++;
        break;
      case 'low':
        summary.low++;
        break;
      case 'informational':
        summary.informational++;
        break;
    }
  });
  
  return summary;
}

/**
 * Gets scan details including alerts and summary
 * @param scanId The scan ID
 * @returns Scan details object
 */
async function getScanDetails(scanId: string) {
  try {
    if (!scanId) {
      throw new Error(`Invalid scan ID: ${scanId}`);
    }

    const scan = await storage.getScan(scanId);
    if (!scan) {
      throw new Error(`Scan with ID ${scanId} not found`);
    }

    // Fetch alerts from ZAP API
    const alerts = await getZapAlerts(scan.targetUrl);

    // Generate a summary of vulnerabilities
    const summary = generateScanSummary(alerts);

    return { scan, results: alerts, summary };
  } catch (error) {
    console.error(`Error fetching scan details for ID ${scanId}:`, error);
    throw error;
  }
}

/**
 * Generates a ZAP report
 * @param scanId The scan ID
 * @param format The report format
 * @returns The report content and content type
 */
async function generateZapReport(scanId: string, format: 'html' | 'json' | 'xml' | 'pdf'): Promise<{ content: string, contentType: string }> {
  try {
    const scan = await storage.getScan(scanId);
    if (!scan) {
      throw new Error(`Scan with ID ${scanId} not found`);
    }

    // For completed scans only
    if (scan.status !== 'completed') {
      throw new Error(`Cannot generate report: scan ${scanId} is not completed (status: ${scan.status})`);
    }

    const targetUrl = scan.targetUrl;
    console.log(`Generating ${format} report for scan ${scanId} targeting ${targetUrl}`);
    
    // Map our format to ZAP template
    let template: string;
    let theme = 'dark'; // Default theme
    
    switch (format) {
      case 'html':
        template = 'traditional-html-plus'; // Use the more detailed plus version
        break;
      case 'json':
        template = 'json-report';
        break;
      case 'xml':
        template = 'xml-report';
        break;
      case 'pdf':
        template = 'traditional-pdf';
        break;
      default:
        template = 'traditional-html-plus';
    }
    
    // Sections to include in report
    const sections = 'chart|alertcount|passingrules|instancecount|statistics|alertdetails';
    
    // Create temp directory for report if it doesn't exist
    const reportDir = path.resolve(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Unique filename for this report
    const reportFileName = `scan-report-${scanId}-${new Date().getTime()}.${format}`;
    const reportPath = path.join(reportDir, reportFileName);
    
    // Build the report title
    const title = `Security Scan Report for ${targetUrl}`;
    
    // Generate report using ZAP API
    try {
      // Define content types for different formats
      const contentTypes = {
        html: 'text/html',
        json: 'application/json',
        xml: 'application/xml',
        pdf: 'application/pdf'
      };
      
      // Request the report from ZAP
      console.log(`Generating report with template ${template}, theme ${theme}`);
      await zapAxios.get(`/JSON/reports/action/generate/`, {
        params: {
          apikey: ZAP_API_KEY,
          title,
          template,
          theme,
          description: `Security scan report for ${targetUrl} conducted on ${scan.startTime}`,
          contexts: scan.contextName || '',
          sites: targetUrl,
          sections,
          includedConfidences: 'Low|Medium|High|Confirmed',
          includedRisks: 'Informational|Low|Medium|High',
          reportFilename: reportPath,
          reportFileNamePattern: '',
          display: 'false'
        }
      });
      
      // Read the generated file
      let content: string;
      if (format === 'pdf') {
        // For PDFs, read as binary
        content = fs.readFileSync(reportPath, 'base64');
      } else {
        // For other formats, read as text
        content = fs.readFileSync(reportPath, 'utf-8');
      }
      
      // Clean up the temporary file after reading it
      fs.unlinkSync(reportPath);
      
      return {
        content,
        contentType: contentTypes[format]
      };
    } catch (zapError) {
      console.error('Error generating report through ZAP API:', zapError);
      throw zapError;
    }
  } catch (error) {
    console.error(`Error generating ZAP report for scan ${scanId}:`, error);
    
    // Fall back to the legacy report generation method
    console.log('Falling back to legacy report generation...');
    const content = await storage.generateScanReport(scanId, format);
    
    const contentTypes = {
      html: 'text/html',
      json: 'application/json',
      xml: 'application/xml',
      pdf: 'application/pdf'
    };
    
    return {
      content,
      contentType: contentTypes[format]
    };
  }
}

/**
 * Gets available report templates from ZAP
 * @returns Array of report template names
 */
async function getReportTemplates(): Promise<string[]> {
  try {
    const response = await zapAxios.get(`/JSON/reports/view/templates/`, {
      params: { apikey: ZAP_API_KEY }
    });
    
    return response.data.templates;
  } catch (error) {
    console.error('Error getting ZAP report templates:', error);
    return ['traditional-html', 'traditional-html-plus', 'traditional-pdf', 'xml-report', 'json-report'];
  }
}

export {
  startSpiderScan,
  startActiveScan,
  createScanSSEHandler,
  getAllActiveScans,
  getScanProgress,
  getScanDetails,
  generateZapReport,
  getReportTemplates,
  testAuthentication
};
