import { useState } from 'react';
import { useLocation } from 'wouter';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/lib/auth-context';
import { Helmet } from 'react-helmet';
import GridBackground from '@/components/GridBackground';
import { toast } from '@/hooks/use-toast';

export default function Signup() {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Account created successfully",
          description: "Please check your email for a confirmation link to verify your account.",
        });
        // Redirect to login page after successful signup
        setLocation('/login');
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
        <title>Create Account | SecureScanAI</title>
      </Helmet>
      
      <div className="absolute inset-0 bg-radial-gradient-accent-blue opacity-20" />
      <GridBackground opacity={0.3} gridSize={30} />
      
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Join SecureScanAI
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Create your account to start securing your web applications
            </p>
          </div>
          
          <AuthForm 
            type="signup"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
} 