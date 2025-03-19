import React from 'react';
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
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const UserSettings: React.FC = () => {
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    defaultValue="Demo User" 
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    defaultValue="demo@example.com" 
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input 
                    id="company" 
                    defaultValue="Example Corp" 
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle" 
                    defaultValue="Security Engineer" 
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
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
              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    className="bg-primary-dark border-accent-blue/30 text-gray-100"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                  Update Password
                </Button>
              </div>
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
              <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-accent-blue mr-2" />
                      <span className="font-medium text-lg">Professional Plan</span>
                    </div>
                    <p className="text-gray-400 mt-1">
                      Your plan renews on April 15, 2025
                    </p>
                  </div>
                  <Button variant="outline" className="border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                    Upgrade Plan
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-base font-medium">Plan Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Up to 50 scans per month</span>
                  </li>
                  <li className="flex items-start">
                    <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Advanced vulnerability detection with AI analysis</span>
                  </li>
                  <li className="flex items-start">
                    <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>PDF report generation</span>
                  </li>
                  <li className="flex items-start">
                    <ToggleRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Email notifications for critical vulnerabilities</span>
                  </li>
                  <li className="flex items-start">
                    <ToggleLeft className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400">API access (Enterprise plan only)</span>
                  </li>
                  <li className="flex items-start">
                    <ToggleLeft className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400">Custom scanning rules (Enterprise plan only)</span>
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
                  <div className="grid grid-cols-3 p-3 text-sm border-b border-accent-blue/10">
                    <div>March 15, 2025</div>
                    <div>$49.99</div>
                    <div>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-accent-blue hover:text-accent-blue/80 hover:bg-accent-blue/10">
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 p-3 text-sm border-b border-accent-blue/10">
                    <div>February 15, 2025</div>
                    <div>$49.99</div>
                    <div>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-accent-blue hover:text-accent-blue/80 hover:bg-accent-blue/10">
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 p-3 text-sm">
                    <div>January 15, 2025</div>
                    <div>$49.99</div>
                    <div>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-accent-blue hover:text-accent-blue/80 hover:bg-accent-blue/10">
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
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
                <p className="text-gray-300">
                  API access is available on Enterprise plans. Upgrade your subscription to generate API keys and access the SecureScan AI API.
                </p>
                <Button variant="outline" className="border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10">
                  Upgrade to Enterprise
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettings;