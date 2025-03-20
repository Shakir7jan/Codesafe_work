import '@testing-library/jest-dom';

// Mock window.ENV for tests
Object.defineProperty(window, 'ENV', {
  value: {
    SUPABASE_URL: 'https://test-supabase-url.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
  },
  writable: true,
});

// Mock console.error in tests to avoid noisy error outputs
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress React error boundary warnings in tests
  if (
    args[0]?.includes?.('Error boundaries should be used with static getDerivedStateFromError()') ||
    args[0]?.includes?.('React will try to recreate this component tree')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Cleanup after tests
afterEach(() => {
  Object.defineProperty(window, 'ENV', {
    value: {
      SUPABASE_URL: 'https://test-supabase-url.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
    },
    writable: true,
  });
});

// Global matchers
// Add any custom matchers here if needed 