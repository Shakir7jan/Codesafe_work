import { useState } from 'react';
import { useLocation } from 'wouter';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/lib/auth-context';
import { Helmet } from 'react-helmet';
import GridBackground from '@/components/GridBackground';

export default function Login() {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Get the redirect URL from the query parameters
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect') || '/dashboard';
        // Redirect to the decoded URL path without encoding it again
        setLocation(decodeURIComponent(redirectTo));
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-dark text-gray-100 py-12">
      <Helmet>
        <title>Sign In | SecureScanAI</title>
      </Helmet>
      
      <div className="absolute inset-0 bg-radial-gradient-accent-blue opacity-20" />
      <GridBackground opacity={0.3} gridSize={30} />
      
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to access your secure dashboard
            </p>
          </div>
          
          <AuthForm 
            type="login"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}