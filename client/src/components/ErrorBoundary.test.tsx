import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { vi, describe, it, expect } from 'vitest';

describe('ErrorBoundary', () => {
  // Suppress console errors during tests
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });

  const ErrorFallback = ({ error }: { error: Error }) => (
    <div data-testid="error-fallback">
      <h2>Error:</h2>
      <p data-testid="error-message">{error.message}</p>
    </div>
  );

  const ThrowingComponent = () => {
    throw new Error('Test error message');
    return null;
  };

  it('should render fallback when child component throws', () => {
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error message');
  });

  it('should not catch errors outside the boundary', () => {
    const outsideError = new Error('Outside error');
    expect(() => {
      throw outsideError;
    }).toThrow(outsideError);
  });
}); 