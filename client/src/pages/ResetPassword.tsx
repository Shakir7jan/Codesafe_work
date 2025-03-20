import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Helmet } from 'react-helmet';
import GridBackground from '@/components/GridBackground';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [, setLocation] = useLocation();

  // Extract the hash fragment to get the access token
  // This is how Supabase delivers the token after redirecting from the email link
  useEffect(() => {
    const handleAuthStateChange = async () => {
      // Check if we have a session from the URL parameters
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Invalid or expired reset link. Please request a new password reset.");
      }
    };

    handleAuthStateChange();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError(undefined);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been successfully reset. You can now sign in with your new password.",
        });
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
        <title>Set New Password | SecureScanAI</title>
      </Helmet>
      
      <div className="absolute inset-0 bg-radial-gradient-accent-blue opacity-20" />
      <GridBackground opacity={0.3} gridSize={30} />
      
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Set New Password
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Create a new secure password for your account
            </p>
          </div>
          
          <Card className="w-full max-w-md mx-auto border border-accent-blue/20 bg-primary-medium/50 shadow-xl shadow-accent-blue/10">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <Shield className="h-10 w-10 text-accent-blue" />
              </div>
              <CardTitle className="text-2xl text-center font-bold">Create New Password</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter and confirm your new password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-primary-dark/50 border-accent-blue/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-primary-dark/50 border-accent-blue/20"
                  />
                  {password !== confirmPassword && confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
                
                {error && <p className="text-sm text-red-500">{error}</p>}
                
                <Button
                  type="submit"
                  className="w-full bg-accent-blue hover:bg-accent-blue-dark"
                  disabled={isLoading || password !== confirmPassword || password.length < 6}
                >
                  {isLoading ? 'Processing...' : 'Reset Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 