import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface AuthWizardProps {
  onAuthConfig: (config: any) => void;
  onClose: () => void;
}

const AuthWizard: React.FC<AuthWizardProps> = ({ onAuthConfig, onClose }) => {
  const [step, setStep] = useState(0);
  const [authType, setAuthType] = useState<'none' | 'form' | 'session-replay'>('none');
  // Form-based
  const [loginUrl, setLoginUrl] = useState('');
  const [usernameField, setUsernameField] = useState('');
  const [passwordField, setPasswordField] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [successPattern, setSuccessPattern] = useState('');
  // Session replay
  const [cookies, setCookies] = useState('');
  const [headers, setHeaders] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleTestSessionReplay = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/zap/test-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authType: 'session-replay',
          cookies,
          headers: headers ? JSON.parse(headers) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult('Authentication successful!');
        toast({ title: 'Session test successful' });
      } else {
        setTestResult(data.message || 'Authentication failed');
        toast({ title: 'Session test failed', description: data.message, variant: 'destructive' });
      }
    } catch (e) {
      setTestResult('Error testing session replay');
      toast({ title: 'Session test failed', description: 'Network or parsing error', variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  const handleFinish = () => {
    if (authType === 'form') {
      onAuthConfig({
        authType: 'form',
        loginUrl,
        usernameField,
        passwordField,
        username,
        password,
        successPattern,
      });
    } else if (authType === 'session-replay') {
      let parsedHeaders = undefined;
      try {
        parsedHeaders = headers ? JSON.parse(headers) : undefined;
      } catch {
        toast({ title: 'Invalid headers JSON', variant: 'destructive' });
        return;
      }
      onAuthConfig({
        authType: 'session-replay',
        cookies,
        headers: parsedHeaders,
      });
    } else {
      onAuthConfig({ authType: 'none' });
    }
    onClose();
  };

  return (
    <div className="p-4 bg-primary-medium rounded-lg border border-accent-blue/20 max-w-lg mx-auto">
      {step === 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2">Authentication Type</h2>
          <div className="space-y-2">
            <Button variant={authType === 'none' ? 'default' : 'outline'} onClick={() => setAuthType('none')} className="w-full">No Authentication</Button>
            <Button variant={authType === 'form' ? 'default' : 'outline'} onClick={() => setAuthType('form')} className="w-full">Form-based Login</Button>
            <Button variant={authType === 'session-replay' ? 'default' : 'outline'} onClick={() => setAuthType('session-replay')} className="w-full">Session Replay (Paste Cookies/Headers)</Button>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleNext} className="bg-accent-blue text-white">Next</Button>
          </div>
        </div>
      )}
      {step === 1 && authType === 'form' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold mb-2">Form-based Authentication</h2>
          <Input placeholder="Login URL" value={loginUrl} onChange={e => setLoginUrl(e.target.value)} />
          <Input placeholder="Username Field Name" value={usernameField} onChange={e => setUsernameField(e.target.value)} />
          <Input placeholder="Password Field Name" value={passwordField} onChange={e => setPasswordField(e.target.value)} />
          <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <Input placeholder="Success Pattern (e.g. Logout link)" value={successPattern} onChange={e => setSuccessPattern(e.target.value)} />
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button onClick={handleFinish} className="bg-accent-blue text-white">Finish</Button>
          </div>
        </div>
      )}
      {step === 1 && authType === 'session-replay' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold mb-2">Session Replay Authentication</h2>
          <label className="text-sm">Paste your session cookies (from browser):</label>
          <Textarea rows={3} value={cookies} onChange={e => setCookies(e.target.value)} placeholder="cookie1=value1; cookie2=value2" />
          <label className="text-sm">Paste custom headers (JSON, optional):</label>
          <Textarea rows={3} value={headers} onChange={e => setHeaders(e.target.value)} placeholder='{"Authorization": "Bearer ..."}' />
          <Button onClick={handleTestSessionReplay} disabled={testing} className="mt-2">{testing ? 'Testing...' : 'Test Authentication'}</Button>
          {testResult && <div className="mt-2 text-sm text-gray-300">{testResult}</div>}
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button onClick={handleFinish} className="bg-accent-blue text-white">Finish</Button>
          </div>
        </div>
      )}
      {step === 1 && authType === 'none' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold mb-2">No Authentication</h2>
          <p className="text-gray-400">The scan will run without authentication.</p>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button onClick={handleFinish} className="bg-accent-blue text-white">Finish</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthWizard;
