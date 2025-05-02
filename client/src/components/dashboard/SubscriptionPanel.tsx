import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ChevronRight, CreditCard, Crown, ArrowUpCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { tierStyles, TierBadge } from './Dashboard';

// Subscription pricing information
const tierPricing = {
  free: { price: 'Free', features: 'Basic scanning capabilities' },
  basic: { price: '$9.99/month', features: 'Enhanced scanning & reports' },
  professional: { price: '$29.99/month', features: 'Advanced scanning with scheduled scans' },
  enterprise: { price: '$99.99/month', features: 'Full capabilities including API access' }
};

// Progress bar with usage information
const UsageBar = ({ current, max, label }: { current: number; max: number; label: string }) => {
  const percentage = Math.min(Math.round((current / max) * 100), 100);
  const isWarning = percentage >= 80;
  const isExceeded = percentage >= 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`text-sm font-medium ${isExceeded ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-gray-300'}`}>
          {current} / {max}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isExceeded ? 'bg-red-950' : isWarning ? 'bg-amber-950' : 'bg-gray-800'}`} 
      />
    </div>
  );
};

interface Plan {
  tier: string;
  features: string[];
  price?: string;
}

interface SubscriptionInfo {
  tier: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  usage: {
    daily: number;
    monthly: number;
    activeScans: number;
  };
  limits: {
    maxScansPerDay: number;
    maxScansPerMonth: number;
    maxActiveScansConcurrent: number;
    scanDepth: number;
    reportFormats: string[];
    [key: string]: any;
  };
}

const SubscriptionPanel = () => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showPlansDialog, setShowPlansDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  
  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/api/subscription');
      console.log('Subscription data fetched:', data);
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription information:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPlans = async () => {
    try {
      const { data } = await axios.get('/api/subscription/plans');
      console.log('Available plans:', data);
      
      // Add pricing information to the plans
      const plansWithPricing = data.map((plan: any) => ({
        ...plan,
        price: getPlanPrice(plan.tier)
      }));
      
      setPlans(plansWithPricing);
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available plans',
        variant: 'destructive',
      });
    }
  };
  
  // Helper function to get plan pricing
  const getPlanPrice = (tier: string) => {
    return tierPricing[tier as keyof typeof tierPricing]?.price || 'Free';
  };
  
  const handleUpgrade = async (tier: string) => {
    if (!tier || tier === subscription?.tier) {
      toast({
        title: 'No Change',
        description: `You are already on the ${tier} plan.`,
      });
      return;
    }
    
    try {
      setIsUpgrading(true);
      console.log(`Upgrading to ${tier} tier...`);
      
      const response = await axios.post('/api/subscription/update', { tier });
      
      console.log("Upgrade response:", response.data);
      
      toast({
        title: 'Subscription Updated',
        description: `Your subscription has been upgraded to ${tier}. Page will reload to apply changes.`,
      });
      
      // Refresh subscription data
      await fetchSubscriptionData();
      
      // Close the dialog
      setShowPlansDialog(false);
      
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
  
  const handleShowUpgradeDialog = () => {
    if (!subscription) return;
    
    // Pre-select the next tier up from current subscription
    const tiers = ['free', 'basic', 'professional', 'enterprise'];
    const currentIndex = tiers.indexOf(subscription.tier);
    const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : subscription.tier;
    setSelectedPlan(nextTier);
    
    setShowPlansDialog(true);
  };
  
  useEffect(() => {
    fetchSubscriptionData();
    fetchPlans();
  }, []);
  
  if (isLoading) {
    return (
      <Card className="bg-primary-medium/30 border-accent-blue/20">
        <CardContent className="p-4 h-48 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            <div className="h-4 bg-gray-800 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!subscription) {
    return (
      <Card className="bg-primary-medium/30 border-accent-blue/20">
        <CardContent className="p-6 text-center text-gray-400">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <p>Could not load subscription information</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={fetchSubscriptionData}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="bg-primary-medium/30 border-accent-blue/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Your Subscription</CardTitle>
            <TierBadge tier={subscription.tier} />
          </div>
          <CardDescription>
            {subscription.isActive 
              ? 'Your subscription is active' 
              : 'Your subscription is inactive'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-2">
          {/* Current tier info with price */}
          <div className="p-3 rounded-md bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-accent-blue/20 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan</h3>
              <span className="font-bold text-accent-blue">{getPlanPrice(subscription.tier)}</span>
            </div>
            <p className="text-sm text-gray-400">{tierPricing[subscription.tier as keyof typeof tierPricing]?.features}</p>
          </div>
        
          <div className="space-y-3">
            <UsageBar 
              current={subscription.usage.daily} 
              max={subscription.limits.maxScansPerDay} 
              label="Daily Scans" 
            />
            <UsageBar 
              current={subscription.usage.monthly} 
              max={subscription.limits.maxScansPerMonth} 
              label="Monthly Scans" 
            />
            <UsageBar 
              current={subscription.usage.activeScans} 
              max={subscription.limits.maxActiveScansConcurrent} 
              label="Active Scans" 
            />
          </div>
          
          <div className="pt-2 border-t border-gray-800">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Current Plan Features</h4>
            <ul className="text-sm space-y-1">
              <li className="flex items-center text-gray-400">
                <CheckCircle className="h-3 w-3 mr-2 text-accent-blue" />
                Scan depth up to {subscription.limits.scanDepth} levels
              </li>
              <li className="flex items-center text-gray-400">
                <CheckCircle className="h-3 w-3 mr-2 text-accent-blue" />
                {subscription.limits.advancedScanOptions ? 'Advanced scan options' : 'Basic scan options'}
              </li>
              <li className="flex items-center text-gray-400">
                <CheckCircle className="h-3 w-3 mr-2 text-accent-blue" />
                {subscription.limits.reportFormats.join(', ')} reports
              </li>
            </ul>
          </div>
          
          <Button
            className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white mt-2"
            onClick={handleShowUpgradeDialog}
            disabled={subscription.tier === 'enterprise'}
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            {subscription.tier === 'enterprise' ? 'Maximum Plan' : 'Upgrade Plan'}
          </Button>
        </CardContent>
      </Card>
      
      {/* Upgrade Plan Dialog */}
      <Dialog open={showPlansDialog} onOpenChange={setShowPlansDialog}>
        <DialogContent className="bg-primary-medium border-accent-blue/20 text-gray-100 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Upgrade Your Subscription</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a plan that best fits your security needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {plans.filter(plan => plan.tier !== 'free').map((plan) => {
              const isCurrentPlan = plan.tier === subscription.tier;
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
                    <span className={`font-bold ${tierStyle.color}`}>{plan.price}</span>
                  </div>
                  
                  <ul className="space-y-1 text-sm">
                    {plan.features.slice(0, 4).map((feature, index) => (
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
              onClick={() => setShowPlansDialog(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleUpgrade(selectedPlan)}
              className="bg-accent-blue hover:bg-accent-blue/90"
              disabled={isUpgrading || selectedPlan === subscription.tier}
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Upgrade to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionPanel; 