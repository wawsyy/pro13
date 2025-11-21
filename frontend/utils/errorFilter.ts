/**
 * Filter out non-critical errors from third-party SDKs
 * These errors don't affect core functionality and can be safely ignored
 */

// List of error patterns to filter out (network errors that don't affect functionality)
const IGNORED_ERROR_PATTERNS = [
  /Failed to fetch/i,
  /Analytics SDK/i,
  /cca-lite\.coinbase\.com/i,
  /ERR_BLOCKED_BY_RESPONSE/i,
  /NotSameOriginAfterDefaultedToSameOriginByCoep/i,
  /net::ERR_BLOCKED_BY_RESPONSE/i,
  /ERR_CONNECTION_CLOSED/i,
  /relayer\.testnet\.zama.*input-proof/i, // Filter relayer network errors, but keep user-facing errors
  /Base Account SDK.*Cross-Origin-Opener-Policy/i, // Base Account SDK conflict with FHEVM COOP requirement
  /Base Account SDK requires the Cross-Origin-Opener-Policy header/i, // Base Account SDK COOP requirement error
  /Base Account SDK requires.*Cross-Origin-Opener-Policy.*not be set/i, // More specific Base Account SDK error
  /Base Account SDK requires.*header.*not be set to.*same-origin/i, // Most specific Base Account SDK error format
  /Cross-Origin-Opener-Policy.*not be set to.*same-origin/i, // COOP same-origin warnings from Base Account SDK
  /Cross-Origin-Opener-Policy.*same-origin/i, // COOP same-origin warnings from Base Account SDK
  /Base Account SDK.*COOP/i, // Alternative Base Account SDK error format
  /checkCrossOriginOpenerPolicy/i, // Base Account SDK internal check function
  /docs\.base\.org.*cross-origin-opener-policy/i, // Base Account SDK documentation links
  /docs\.base\.org.*smart-wallet.*quickstart/i, // Base Account SDK documentation links (alternative format)
  /@base-org\/account/i, // Base Account SDK package name
  /9e883_%40base-org_account/i, // Base Account SDK chunk file name
  /9e883_.*@base-org.*account/i, // Base Account SDK chunk file name (alternative format)
];

// List of error sources to filter out
const IGNORED_ERROR_SOURCES = [
  'coinbase.com',
  'analytics',
  'relayer.testnet.zama',
  '@base-org/account',
  'base-org',
];

/**
 * Check if an error should be ignored
 */
export function shouldIgnoreError(error: Error | string, source?: string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message || error.toString();
  const errorStack = typeof error === 'string' ? '' : error.stack || '';

  // Check error message patterns
  for (const pattern of IGNORED_ERROR_PATTERNS) {
    if (pattern.test(errorMessage) || pattern.test(errorStack)) {
      return true;
    }
  }

  // Check source
  if (source) {
    for (const ignoredSource of IGNORED_ERROR_SOURCES) {
      if (source.includes(ignoredSource)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Setup error filtering for console methods
 */
export function setupErrorFiltering() {
  if (typeof window === 'undefined') {
    return; // Only run in browser
  }

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: any[]) => {
    // Convert all args to string for pattern matching
    const errorString = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message + ' ' + (arg.stack || '');
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');

    // Also check individual arguments for better matching
    const allErrorText = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message;
      return String(arg);
    }).join(' ');

    // Check stack traces if available
    const stackTraces = args
      .filter(arg => arg instanceof Error && arg.stack)
      .map(arg => (arg as Error).stack || '')
      .join(' ');

    const combinedErrorText = errorString + ' ' + allErrorText + ' ' + stackTraces;

    // Check if this error should be ignored
    if (shouldIgnoreError(combinedErrorText)) {
      // Silently ignore - these are non-critical third-party SDK errors
      return;
    }

    // Call original error handler
    originalError.apply(console, args);
  };

  // Override console.warn for similar filtering if needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = (...args: any[]) => {
    // Convert all args to string for pattern matching
    const warningString = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message + ' ' + (arg.stack || '');
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');

    // Check if this warning should be ignored
    if (shouldIgnoreError(warningString)) {
      // Silently ignore - these are non-critical third-party SDK warnings
      return;
    }

    // Call original warn handler
    originalWarn.apply(console, args);
  };

  // Also handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const errorString = error instanceof Error ? error.message + ' ' + (error.stack || '') : String(error);
    
    if (shouldIgnoreError(errorString)) {
      event.preventDefault(); // Prevent default error logging
      // Silently ignore - these are non-critical third-party SDK errors
    }
  }, { capture: true });

  // Handle global errors
  window.addEventListener('error', (event) => {
    const error = event.error || event.message;
    const source = event.filename || '';
    const errorString = error instanceof Error ? error.message + ' ' + (error.stack || '') : String(error);
    
    if (shouldIgnoreError(errorString, source)) {
      event.preventDefault(); // Prevent default error logging
      // Silently ignore - these are non-critical third-party SDK errors
    }
  }, { capture: true });
}

