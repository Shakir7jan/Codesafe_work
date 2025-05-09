import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Key, 
  Shield, 
  CreditCard, 
  Download, 
  Trash2, 
  ToggleLeft,
  ToggleRight,
  Save,
  Crown,
  ArrowUpCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { TierBadge, tierStyles } from './Dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getCurrentUser, updateProfile, updatePassword, deleteAccount } from '@/lib/supabase';
import { useLocation } from 'wouter';

// Tier pricing information (should match SubscriptionPanel)
const tierPricing = {
  free: { price: 'Free', features: 'Basic scanning capabilities' },
  basic: { price: '$9.99/month', features: 'Enhanced scanning & reports' },
  professional: { price: '$29.99/month', features: 'Advanced scanning with scheduled scans' },
  enterprise: { price: '$99.99/month', features: 'Full capabilities including API access' }
};

interface SubscriptionData {
  tier: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  limits: {
    maxScansPerDay: number;
    maxScansPerMonth: number;
    maxActiveScansConcurrent: number;
    scanDepth: number;
    advancedScanOptions: boolean;
    scheduledScans: boolean;
    scanTypes: string[];
    reportFormats: string[];
    [key: string]: any;
  };
}

const UserSettings: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    company: '',
    jobTitle: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchSubscriptionData();
    fetchAvailablePlans();
    fetchProfile();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoadingSubscription(true);
      const { data } = await axios.get('/api/subscription');
      console.log('Subscription data in settings:', data);
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription information:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription information',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const { data } = await axios.get('/api/subscription/plans');
      console.log('Available plans in settings:', data);
      setAvailablePlans(data);
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
    }
  };

  const fetchProfile = async () => {
    const { user, error } = await getCurrentUser();
    if (user) {
      setProfile({
        fullName: user.user_metadata?.fullName || '',
        email: user.email || '',
        company: user.user_metadata?.company || '',
        jobTitle: user.user_metadata?.jobTitle || '',
      });
    }
  };

  const handleShowUpgradeDialog = () => {
    if (!subscription) return;
    
    // Pre-select the next tier up from current subscription
    const tiers = ['free', 'basic', 'professional', 'enterprise'];
    const currentIndex = tiers.indexOf(subscription.tier);
    const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : subscription.tier;
    setSelectedPlan(nextTier);
    
    setShowUpgradeDialog(true);
  };

  const handleUpgradePlan = async () => {
    if (!selectedPlan || selectedPlan === subscription?.tier) return;
    
    try {
      setIsUpgrading(true);
      console.log(`Upgrading to ${selectedPlan} tier from settings...`);
      
      const response = await axios.post('/api/subscription/update', { tier: selectedPlan });
      console.log("Upgrade response:", response.data);
      
      toast({
        title: 'Subscription Updated',
        description: `Your subscription has been upgraded to ${selectedPlan}. Page will reload to apply changes.`,
      });
      
      // Close the dialog
      setShowUpgradeDialog(false);
      
      // Short delay before reload to allow toast to be seen
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Failed to upgrade subscription:', error);
      toast({
        title: 'Upgrade Failed',
        description: error.response?.data?.message || 'Failed to upgrade your subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      // Update profile in Supabase
      const { error } = await updateProfile({
        fullName: profile.fullName,
        company: profile.company,
        jobTitle: profile.jobTitle,
      });
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Profile updated',
          description: 'Your profile information has been saved.',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordError(error.message);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password Updated',
          description: 'Your password has been changed successfully.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to update password.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await deleteAccount();
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Account Deleted',
          description: 'Your account has been successfully deleted.',
        });
        
        // Redirect to home page after successful deletion
        setTimeout(() => {
          setLocation('/');
        }, 1500);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete account.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Format date string for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-primary-medium/30 border border-accent-blue/20 p-1">
          <TabsTrigger 
            value="account" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Account
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger 
            value="api" 
            className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue"
          >
            API Access
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 text-accent-blue mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your profile details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      className="bg-primary-dark border-accent-blue/30 text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-primary-dark border-accent-blue/30 text-gray-100 opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={handleProfileChange}
                      className="bg-primary-dark border-accent-blue/30 text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={profile.jobTitle}
                      onChange={handleProfileChange}
                      className="bg-primary-dark border-accent-blue/30 text-gray-100"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    type="submit"
                    className="bg-accent-blue hover:bg-accent-blue/90 text-white"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? 'Saving...' : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Account
              </CardTitle>
              <CardDescription className="text-gray-400">
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                This action is irreversible and will delete all your scan history, reports, and settings.
              </p>
              <Button 
                variant="outline" 
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 text-accent-blue mr-2" />
                Password
              </CardTitle>
              <CardDescription className="text-gray-400">
                Change your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                    autoComplete="current-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                    autoComplete="new-password"
                  />
                </div>
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                <div className="flex justify-end">
                  <Button 
                    className="bg-accent-blue hover:bg-accent-blue/90 text-white"
                    type="submit"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 text-accent-blue mr-2" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-gray-400">
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-400">
                    Protect your account with an additional verification step
                  </p>
                </div>
                <Switch id="2fa" />
              </div>
              
              <Separator className="bg-accent-blue/20" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium">Recovery Codes</h4>
                  <p className="text-sm text-gray-400">
                    Generate backup codes to access your account if you lose your 2FA device
                  </p>
                </div>
                <Button variant="outline" className="border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                  Generate Codes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 text-accent-blue mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium">Scan Completion</h4>
                    <p className="text-sm text-gray-400">
                      Get notified when a security scan finishes
                    </p>
                  </div>
                  <Switch id="scanCompletionNotification" defaultChecked />
                </div>
                
                <Separator className="bg-accent-blue/20" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium">Critical Vulnerabilities</h4>
                    <p className="text-sm text-gray-400">
                      Receive alerts for high-severity security issues
                    </p>
                  </div>
                  <Switch id="criticalVulnerabilityNotification" defaultChecked />
                </div>
                
                <Separator className="bg-accent-blue/20" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium">Scan Failures</h4>
                    <p className="text-sm text-gray-400">
                      Get notified when a security scan fails to complete
                    </p>
                  </div>
                  <Switch id="scanFailureNotification" defaultChecked />
                </div>
                
                <Separator className="bg-accent-blue/20" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium">Product Updates</h4>
                    <p className="text-sm text-gray-400">
                      Receive information about new features and improvements
                    </p>
                  </div>
                  <Switch id="productUpdateNotification" />
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="text-base font-medium mb-3">Notification Method</h4>
                <RadioGroup defaultValue="email">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email-notification" />
                    <Label htmlFor="email-notification">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms-notification" />
                    <Label htmlFor="sms-notification">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both-notification" />
                    <Label htmlFor="both-notification">Both Email and SMS</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 text-accent-blue mr-2" />
                Subscription Plan
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSubscription ? (
                <div className="py-4 space-y-3">
                  <div className="h-8 bg-gray-800 animate-pulse rounded-md w-1/2"></div>
                  <div className="h-4 bg-gray-800 animate-pulse rounded-md w-3/4"></div>
                  <div className="h-4 bg-gray-800 animate-pulse rounded-md w-2/3"></div>
                </div>
              ) : subscription ? (
                <>
                  <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 text-accent-blue mr-2" />
                          <span className="font-medium text-lg capitalize">{subscription.tier} Plan</span>
                        </div>
                        <p className="text-gray-400 mt-1">
                          {subscription.endDate ? (
                            `Your plan renews on ${formatDate(subscription.endDate)}`
                          ) : (
                            `Started on ${formatDate(subscription.startDate)}`
                          )}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10"
                        onClick={handleShowUpgradeDialog}
                        disabled={subscription.tier === 'enterprise'}
                      >
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                        {subscription.tier === 'enterprise' ? 'Maximum Plan' : 'Upgrade Plan'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-base font-medium">Plan Features</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Up to {subscription.limits.maxScansPerMonth} scans per month</span>
                      </li>
                      <li className="flex items-start">
                        <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Maximum scan depth of {subscription.limits.scanDepth} levels</span>
                      </li>
                      <li className="flex items-start">
                        <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Report formats: {subscription.limits.reportFormats.join(', ')}</span>
                      </li>
                      <li className="flex items-start">
                        {subscription.limits.scheduledScans ? (
                          <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={subscription.limits.scheduledScans ? '' : 'text-gray-400'}>
                          Scheduled scans
                        </span>
                      </li>
                      <li className="flex items-start">
                        {subscription.limits.advancedScanOptions ? (
                          <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={subscription.limits.advancedScanOptions ? '' : 'text-gray-400'}>
                          Advanced scan options
                        </span>
                      </li>
                      <li className="flex items-start">
                        {subscription.limits.apiAccess ? (
                          <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={subscription.limits.apiAccess ? '' : 'text-gray-400'}>
                          API access
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  <Separator className="bg-accent-blue/20 my-6" />
                  
                  <div className="space-y-4">
                    <h4 className="text-base font-medium">Payment Method</h4>
                    <div className="flex items-center">
                      <div className="bg-primary-dark/50 border border-accent-blue/20 rounded-md px-3 py-2 flex items-center">
                        <CreditCard className="h-5 w-5 text-accent-blue mr-2" />
                        <span>•••• •••• •••• 4242</span>
                        <span className="ml-4 text-sm text-gray-400">Expires 05/26</span>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-4 text-accent-blue hover:text-accent-blue/80 hover:bg-accent-blue/10">
                        Update
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-base font-medium mb-3">Billing History</h4>
                    <div className="bg-primary-dark/30 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-3 text-xs text-gray-400 p-3 border-b border-accent-blue/20">
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Receipt</div>
                      </div>
                      {/* Sample billing history - would be dynamic in a real app */}
                      <div className="grid grid-cols-3 p-3 text-sm border-b border-accent-blue/10">
                        <div>{formatDate(new Date().toISOString())}</div>
                        <div>{tierPricing[subscription.tier as keyof typeof tierPricing]?.price}</div>
                        <div>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-accent-blue hover:text-accent-blue/80 hover:bg-accent-blue/10">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-400">Could not load subscription information</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={fetchSubscriptionData}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Access Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card className="bg-primary-medium/30 border-accent-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 text-accent-blue mr-2" />
                API Keys
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your API keys for programmatic access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscription && subscription.limits.apiAccess ? (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Generate an API key to use the CodeSafe API programmatically. Your API key provides access to all features of your {subscription.tier} tier.
                    </p>
                    <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                      Generate API Key
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-300">
                      API access is available on Enterprise plans. Upgrade your subscription to generate API keys and access the CodeSafe API.
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10"
                      onClick={handleShowUpgradeDialog}
                    >
                      Upgrade to Enterprise
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Plan Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="bg-primary-medium border-accent-blue/20 text-gray-100 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Upgrade Your Subscription</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a plan that best fits your security needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {availablePlans
              .filter(plan => plan.tier !== 'free')
              .map((plan) => {
                const isCurrentPlan = plan.tier === subscription?.tier;
                const isSelectedPlan = plan.tier === selectedPlan;
                const tierStyle = tierStyles[plan.tier as keyof typeof tierStyles] || tierStyles.free;
                
                return (
                  <div 
                    key={plan.tier}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelectedPlan 
                        ? `${tierStyle.borderColor} ${tierStyle.bgColor}` 
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                    onClick={() => setSelectedPlan(plan.tier)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Crown className={`h-5 w-5 mr-2 ${tierStyle.color}`} />
                        <h3 className="font-medium">{plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}</h3>
                      </div>
                      <span className={`font-bold ${tierStyle.color}`}>{tierPricing[plan.tier as keyof typeof tierPricing]?.price}</span>
                    </div>
                    
                    <ul className="space-y-1 text-sm">
                      {plan.features.slice(0, 4).map((feature: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-3 w-3 mr-2 text-accent-blue flex-shrink-0 mt-1" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {isCurrentPlan && (
                      <Badge className="mt-3 bg-accent-blue/20 text-accent-blue">Current Plan</Badge>
                    )}
                  </div>
                );
            })}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUpgradeDialog(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpgradePlan}
              className="bg-accent-blue hover:bg-accent-blue/90"
              disabled={isUpgrading || selectedPlan === subscription?.tier}
            >
              {isUpgrading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Upgrading...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Upgrade to {selectedPlan ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-primary-medium border-accent-blue/20 text-gray-100 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-400 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Delete Your Account
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action is permanent and cannot be undone
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-900/20 border border-red-500/30 rounded-md p-4 mb-4">
              <p className="text-gray-200">All your data will be permanently removed, including:</p>
              <ul className="list-disc list-inside mt-2 text-gray-300 space-y-1 text-sm">
                <li>Account information and profile</li>
                <li>Security scan history and reports</li>
                <li>Subscription and billing information</li>
                <li>API keys and custom settings</li>
              </ul>
            </div>
            
            <p className="text-gray-300">Please type <span className="font-mono text-red-400">DELETE</span> to confirm account deletion.</p>
            <Input 
              className="bg-primary-dark border-red-500/30 text-gray-100 mt-2"
              placeholder="Type DELETE to confirm"
              onChange={(e) => {
                const confirmButton = document.getElementById('confirm-delete-button') as HTMLButtonElement;
                if (confirmButton) {
                  confirmButton.disabled = e.target.value !== 'DELETE';
                }
              }}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              id="confirm-delete-button"
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={true}
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Permanently Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSettings;