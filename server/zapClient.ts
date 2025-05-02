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
const ZAP_API_KEY = process.env.ZAP_API_KEY || "";

// Log warning but don't exit - allow fallback to empty API key for dev environments
if (!ZAP_API_KEY) {
  console.warn("WARNING: ZAP_API_KEY is missing. Using empty API key for local ZAP instance.");
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
  authType: 'form' | 'script' | 'basic' | 'jwt' | 'json';
  loginUrl?: string;
  loginRequestData?: string;
  loginPageValidationRegex?: string;
  scriptName?: string;
  credentials: {
    username: string;
    password: string;
    [key: string]: string;
  };
  headers?: Record<string, string>;
  pollUrl?: string;
  loggedOutRegex?: string;
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

// Helper: Ensure session management script is loaded in ZAP
async function ensureSessionScriptLoaded(scriptName: string, scriptPath: string) {
  // Check if script is already loaded
  const scriptsResp = await zapAxios.get('/JSON/script/view/list/');
  const loaded = scriptsResp.data?.list?.some((s: any) => s.name === scriptName);
  if (!loaded) {
    // Upload the script
    const absolutePath = path.resolve(scriptPath);
    await zapAxios.get('/JSON/script/action/load/', {
      params: {
        apikey: ZAP_API_KEY,
        scriptName,
        scriptType: 'session',
        scriptEngine: 'ECMAScript : Oracle Nashorn',
        fileName: absolutePath
      }
    });
    console.log(`Session script ${scriptName} loaded into ZAP.`);
  } else {
    console.log(`Session script ${scriptName} already loaded.`);
  }
}

// Function to set up authentication context in ZAP
async function setupAuthContext(targetUrl: string, authConfig: AuthConfig): Promise<{ contextId: string, contextName: string, userId?: string }> {
  if (authConfig.authType === 'json') {
    return await setupJsonBasedAuthContext(targetUrl, authConfig);
  }

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
    // Check if the URL was actually included
    const contextInfo = await zapAxios.get(`/JSON/context/view/context/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextName: contextName
      }
    });
    console.log('Context setup info:', contextInfo.data);
    console.log(`Setting up ${authConfig.authType} authentication for context: ${contextName}`);
    // 3. Set up authentication method based on authType
    if (authConfig.authType === 'form') {
      await setupFormAuthentication(zapContextId, authConfig);
    } else if (authConfig.authType === 'json') {
      await setupJsonAuthentication(zapContextId, authConfig);
    } else if (authConfig.authType === 'script') {
      await setupScriptAuthentication(zapContextId, authConfig);
    } else if (authConfig.authType === 'basic') {
      await setupBasicAuthentication(zapContextId, authConfig);
    } else if (authConfig.authType === 'jwt') {
      await setupJwtAuthentication(zapContextId, authConfig);
    }
    // 4. Create a new user and credentials
    if (authConfig.credentials) {
      const userId = await createAuthUser(zapContextId, authConfig.credentials);
      // 5. Enable forced user mode if needed
      await zapAxios.get(`/JSON/forcedUser/action/setForcedUserModeEnabled/`, {
        params: {
          apikey: ZAP_API_KEY,
          boolean: 'true'
        }
      });
      console.log(`Authentication context ${contextName} successfully set up`);
      return { contextId: zapContextId, contextName, userId };
    }
    return { contextId: zapContextId, contextName };
  } catch (error) {
    console.error('Failed to set up authentication context:', error);
    throw new Error('Failed to set up authentication context');
  }
}

// Set up form-based authentication
async function setupFormAuthentication(contextId: string, authConfig: AuthConfig): Promise<void> {
  try {
    // Ensure loginUrl and loginRequestData are present
    const loginUrl = authConfig.loginUrl || '';
    const loginRequestData = authConfig.loginRequestData || '';
    if (!loginUrl || !loginRequestData) {
      throw new Error('loginUrl and loginRequestData are required for form-based authentication');
    }
    // Build the raw string exactly as in the working curl
    const rawAuthMethodConfigParams = `loginUrl=${loginUrl}&loginRequestData=${loginRequestData}`;
    // DO NOT encode, just pass the raw string!
    console.log('Auth config raw string:', rawAuthMethodConfigParams);
    await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        authMethodName: 'formBasedAuthentication',
        authMethodConfigParams: rawAuthMethodConfigParams
      }
    });
    // Set login page verification if provided
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

// Set up JSON-based authentication
async function setupJsonAuthentication(contextId: string, authConfig: AuthConfig): Promise<void> {
  try {
    // Ensure loginUrl and loginRequestData are present
    const loginUrl = authConfig.loginUrl || '';
    const loginRequestData = authConfig.loginRequestData || '';
    if (!loginUrl || !loginRequestData) {
      throw new Error('loginUrl and loginRequestData are required for JSON-based authentication');
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
    console.error('Failed to set up JSON-based authentication:', error);
    throw error;
  }
}

// Set up script-based authentication
async function setupScriptAuthentication(contextId: string, authConfig: AuthConfig): Promise<void> {
  try {
    if (!authConfig.scriptName) {
      throw new Error('Script name is required for script authentication');
    }
    
    // Set up script-based authentication
    await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        authMethodName: 'scriptBasedAuthentication',
        authMethodConfigParams: `scriptName=${authConfig.scriptName}&${authConfig.loginRequestData || ''}`
      }
    });
  } catch (error) {
    console.error('Failed to set up script authentication:', error);
    throw error;
  }
}

// Set up basic authentication
async function setupBasicAuthentication(contextId: string, authConfig: AuthConfig): Promise<void> {
  try {
    // Set up HTTP basic authentication
    await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        authMethodName: 'httpAuthentication',
        authMethodConfigParams: `hostname=${new URL(authConfig.loginUrl || '').hostname}&realm=&port=80`
      }
    });
  } catch (error) {
    console.error('Failed to set up basic authentication:', error);
    throw error;
  }
}

// Set up JWT authentication
async function setupJwtAuthentication(contextId: string, authConfig: AuthConfig): Promise<void> {
  try {
    // JWT authentication often requires a script or custom handler
    // This is a simplified example - in reality JWT would use scriptBasedAuthentication
    await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        authMethodName: 'scriptBasedAuthentication',
        authMethodConfigParams: `scriptName=jwt-auth&loginUrl=${authConfig.loginUrl || ''}&loginRequestData=${authConfig.loginRequestData || ''}`
      }
    });
  } catch (error) {
    console.error('Failed to set up JWT authentication:', error);
    throw error;
  }
}

// Create a user with the given credentials
async function createAuthUser(contextId: string, credentials: AuthConfig['credentials']): Promise<string> {
  try {
    const userIdResp = await zapAxios.get(`/JSON/users/action/newUser/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        name: `auth_user_${Date.now()}`
      }
    });
    const userId = userIdResp.data.userId;
    if (!userId || userId === '0') throw new Error('Failed to create a valid ZAP userId');
    const credentialParams = Object.entries(credentials)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    await zapAxios.get(`/JSON/users/action/setAuthenticationCredentials/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        userId: userId,
        authCredentialsConfigParams: credentialParams
      }
    });
    await zapAxios.get(`/JSON/users/action/setUserEnabled/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        userId: userId,
        enabled: 'true'
      }
    });
    await zapAxios.get(`/JSON/forcedUser/action/setForcedUser/`, {
      params: {
        apikey: ZAP_API_KEY,
        contextId: contextId,
        userId: userId
      }
    });
    console.log(`Authentication user created and enabled for context ${contextId}, userId: ${userId}`);
    return userId;
  } catch (error) {
    console.error('Failed to create authentication user:', error);
    throw error;
  }
}

// Robust JSON-based Auth Context Setup for Juice Shop
async function setupJsonBasedAuthContext(targetUrl: string, authConfig: AuthConfig): Promise<{ contextId: string, contextName: string, userId: string }> {
  // 1. Create a new context
  const contextName = `JsonBasedAuth_${Date.now()}`;
  const contextResp = await zapAxios.get(`/JSON/context/action/newContext/`, {
    params: { apikey: ZAP_API_KEY, contextName }
  });
  const contextId = contextResp.data.contextId;
  console.log(`[ZAP] Created context: ${contextName} (ID: ${contextId})`);

  // 2. Include the target URL in context
  const includeRegex = `${new URL(targetUrl).origin}.*`;
  await zapAxios.get(`/JSON/context/action/includeInContext/`, {
    params: { apikey: ZAP_API_KEY, contextName, regex: includeRegex }
  });
  console.log(`[ZAP] Included URL pattern: ${includeRegex}`);

  // 3. Set JSON-based authentication method with correct username/password mapping
  const loginUrl = authConfig.loginUrl;
  const loginBody = authConfig.loginRequestData;
  // Always set username=email and password=password for Juice Shop
  const authMethodConfigParams = `loginUrl=${loginUrl}&loginRequestData=${loginBody}&username=email&password=password`;
  await zapAxios.get(`/JSON/authentication/action/setAuthenticationMethod/`, {
    params: {
      apikey: ZAP_API_KEY,
      contextId,
      authMethodName: 'jsonBasedAuthentication',
      authMethodConfigParams
    }
  });
  console.log(`[ZAP] Set JSON-based authentication with username=email and password=password`);

  // 4. Set logged-in and logged-out indicators
  await zapAxios.get(`/JSON/authentication/action/setLoggedInIndicator/`, {
    params: { apikey: ZAP_API_KEY, contextId, loggedInIndicatorRegex: '\\Qemail\\E' }
  });
  await zapAxios.get(`/JSON/authentication/action/setLoggedOutIndicator/`, {
    params: { apikey: ZAP_API_KEY, contextId, loggedOutIndicatorRegex: '\\Q{"user":{}}\\E' }
  });
  console.log(`[ZAP] Set logged-in indicator to \\Qemail\\E and logged-out indicator to \\Q{"user":{}}\\E`);

  // 5. Load and set script-based session management
  const scriptName = 'SessionScriptJShop.js';
  const scriptPath = path.resolve(__dirname, '../scripts/SessionScriptJShop.js');
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`[ZAP] Session script file not found at: ${scriptPath}`);
  }
  // Check if script is already loaded
  const scriptsResp = await zapAxios.get('/JSON/script/view/scripts/', { params: { apikey: ZAP_API_KEY } });
  const scriptExists = scriptsResp.data?.scripts?.some((s: any) => s.name === scriptName);
  if (!scriptExists) {
    await zapAxios.get('/JSON/script/action/load/', {
      params: {
        apikey: ZAP_API_KEY,
        scriptName,
        scriptType: 'session',
        scriptEngine: 'Oracle Nashorn',
        fileName: scriptPath,
        charset: 'UTF-8'
      }
    });
    console.log(`[ZAP] Loaded session script: ${scriptName}`);
  } else {
    console.log(`[ZAP] Session script already loaded: ${scriptName}`);
  }
  // Set session management to script-based
  await zapAxios.get(`/JSON/sessionManagement/action/setSessionManagementMethod/`, {
    params: {
      apikey: ZAP_API_KEY,
      contextId,
      methodName: 'scriptBasedSessionManagement',
      methodConfigParams: `scriptName=${scriptName}`
    }
  });
  console.log(`[ZAP] Set session management to script-based with script: ${scriptName}`);

  // 6. Create a user in the context and set credentials
  const userResp = await zapAxios.get(`/JSON/users/action/newUser/`, {
    params: { apikey: ZAP_API_KEY, contextId, name: `json_user_${Date.now()}` }
  });
  const userId = userResp.data.userId;
  if (!userId || userId === '0') {
    throw new Error('[ZAP] Failed to create a valid ZAP user ID');
  }
  // Set credentials with correct mapping
  const username = authConfig.credentials.username;
  const password = authConfig.credentials.password;
  const credentialParams = `username=${username}&password=${password}`;
  await zapAxios.get(`/JSON/users/action/setAuthenticationCredentials/`, {
    params: { apikey: ZAP_API_KEY, contextId, userId, authCredentialsConfigParams: credentialParams }
  });
  await zapAxios.get(`/JSON/users/action/setUserEnabled/`, {
    params: { apikey: ZAP_API_KEY, contextId, userId, enabled: 'true' }
  });
  console.log(`[ZAP] Created and enabled user with correct credentials: ${username}`);

  // 7. Set forced user mode and set forced user
  await zapAxios.get(`/JSON/forcedUser/action/setForcedUserModeEnabled/`, {
    params: { apikey: ZAP_API_KEY, boolean: 'true' }
  });
  await zapAxios.get(`/JSON/forcedUser/action/setForcedUser/`, {
    params: { apikey: ZAP_API_KEY, contextId, userId }
  });
  console.log(`[ZAP] Forced user mode enabled and set to user ${userId}`);

  return { contextId, contextName, userId };
}

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

function handleError(action: string, error: any) {
  if (axios.isAxiosError(error) && error.response) {
    console.error(`Error ${action}: ${error.message}`);
    console.error("API Error Response:", error.response.data);
  } else {
    console.error(`Unexpected error ${action}:`, error);
  }
}

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

function getAllActiveScans(): ScanProgress[] {
  // Convert the Map values to an array
  return Array.from(activeScans.entries()).map(([scanId, scan]) => ({
    scanId,
    type: scan.type,
    status: scan.status === "error" ? "error" : "running",
    progress: scan.progress,
    targetUrl: scan.targetUrl,
    startTime: scan.startTime
  }));
}

function getScanProgress(scanId: string): ScanProgress | null {
  const scan = activeScans.get(scanId);
  if (!scan) return null;
  
  return {
    scanId,
    type: scan.type,
    status: scan.status === "error" ? "error" : "running",
    progress: scan.progress,
    targetUrl: scan.targetUrl,
    startTime: scan.startTime
  };
}

async function getZapAlerts(targetUrl: string, startIndex = 0, count = 5000): Promise<ZapAlert[]> {
  try {
    const response = await zapAxios.get(
      `/JSON/alert/view/alerts/`, {
        params: {
          apikey: ZAP_API_KEY,
          baseurl: targetUrl,
          start: startIndex,
          count: count,
        }
      }
    );

    return response.data.alerts.map((alert: any) => ({
      pluginId: alert.pluginId,
      risk: alert.risk,
      confidence: alert.confidence,
      url: alert.url,
      name: alert.name,
      description: alert.description,
      solution: alert.solution,
      reference: alert.reference,
      cweid: alert.cweid,
      wascid: alert.wascid,
      messageId: alert.messageId,
      evidence: alert.evidence,
    }));
  } catch (error) {
    console.error('Error fetching alerts from ZAP API:', error);
    throw new Error('Failed to fetch scan alerts');
  }
}

function generateScanSummary(alerts: ZapAlert[]) {
  return {
    total: alerts.length,
    high: alerts.filter(a => a.risk === 'High').length,
    medium: alerts.filter(a => a.risk === 'Medium').length,
    low: alerts.filter(a => a.risk === 'Low').length,
    informational: alerts.filter(a => a.risk === 'Informational').length,
  };
}

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

export {
  startSpiderScan,
  startActiveScan,
  createScanSSEHandler,
  getAllActiveScans,
  getScanProgress,
  getScanDetails
};
