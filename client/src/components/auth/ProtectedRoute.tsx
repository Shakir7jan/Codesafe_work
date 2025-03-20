import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import LoadingScreen from '@/components/LoadingScreen';

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      setLocation(`/login?redirect=${encodeURIComponent(location)}`);
    }
  }, [user, loading, setLocation, location]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Only render children if the user is authenticated
  return user ? <>{children}</> : null;
} 