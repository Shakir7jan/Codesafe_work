import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Link } from 'wouter';

type FormType = 'login' | 'signup' | 'forgot-password';

type AuthFormProps = {
  type: FormType;
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
};

export function AuthForm({ type, onSubmit, isLoading, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'signup' && password !== confirmPassword) {
      return; // Add validation message if needed
    }
    
    await onSubmit(email, password);
  };

  const titles = {
    'login': 'Sign In',
    'signup': 'Create Account',
    'forgot-password': 'Reset Password'
  };
  
  const descriptions = {
    'login': 'Enter your credentials to access your account',
    'signup': 'Fill out the form below to create your account',
    'forgot-password': 'Enter your email to receive a password reset link'
  };
  
  const buttonText = {
    'login': 'Sign In',
    'signup': 'Sign Up',
    'forgot-password': 'Send Reset Link'
  };

  return (
    <Card className="w-full max-w-md mx-auto border border-accent-blue/20 bg-primary-medium/50 shadow-xl shadow-accent-blue/10">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <Shield className="h-10 w-10 text-accent-blue" />
        </div>
        <CardTitle className="text-2xl text-center font-bold">{titles[type]}</CardTitle>
        <CardDescription className="text-center text-gray-400">
          {descriptions[type]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-primary-dark/50 border-accent-blue/20"
            />
          </div>
          
          {type !== 'forgot-password' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                {type === 'login' && (
                  <Link href="/forgot-password" className="text-xs text-accent-blue-light hover:text-accent-blue">
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-primary-dark/50 border-accent-blue/20"
              />
            </div>
          )}
          
          {type === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-primary-dark/50 border-accent-blue/20"
              />
              {password !== confirmPassword && confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
          )}
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <Button
            type="submit"
            className="w-full bg-accent-blue hover:bg-accent-blue-dark"
            disabled={isLoading || (type === 'signup' && password !== confirmPassword)}
          >
            {isLoading ? 'Processing...' : buttonText[type]}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {type === 'login' ? (
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-accent-blue-light hover:text-accent-blue">
              Sign up
            </Link>
          </p>
        ) : type === 'signup' ? (
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-blue-light hover:text-accent-blue">
              Sign in
            </Link>
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            Remember your password?{' '}
            <Link href="/login" className="text-accent-blue-light hover:text-accent-blue">
              Sign in
            </Link>
          </p>
        )}
      </CardFooter>
    </Card>
  );
} 