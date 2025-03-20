import { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/lib/auth-context';
import { Helmet } from 'react-helmet';
import GridBackground from '@/components/GridBackground';
import { toast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (email: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Reset link sent",
          description: "If an account exists with that email, you'll receive a password reset link shortly.",
        });
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
        <title>Reset Password | SecureScanAI</title>
      </Helmet>
      
      <div className="absolute inset-0 bg-radial-gradient-accent-blue opacity-20" />
      <GridBackground opacity={0.3} gridSize={30} />
      
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Enter your email to receive a password reset link
            </p>
          </div>
          
          <AuthForm 
            type="forgot-password"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
} 