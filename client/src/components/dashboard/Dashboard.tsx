import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, AlertTriangle, CheckCircle, Activity, Loader2, Crown } from 'lucide-react';
import ScanManager from './ScanManager';
import SubscriptionPanel from './SubscriptionPanel';

// CSS animation class for fade-in effect
const fadeInAnimation = "transition-all duration-500 ease-out transform";

// Define tier colors and icons for consistent styling
export const tierStyles = {
  free: { color: 'text-gray-400', bgColor: 'bg-gray-400/20', borderColor: 'border-gray-400/30', glowColor: 'rgba(156, 163, 175, 0.4)' },
  basic: { color: 'text-blue-400', bgColor: 'bg-blue-400/20', borderColor: 'border-blue-400/30', glowColor: 'rgba(96, 165, 250, 0.4)' },
  professional: { color: 'text-purple-400', bgColor: 'bg-purple-400/20', borderColor: 'border-purple-400/30', glowColor: 'rgba(192, 132, 252, 0.4)' },
  enterprise: { color: 'text-amber-400', bgColor: 'bg-amber-400/20', borderColor: 'border-amber-400/30', glowColor: 'rgba(251, 191, 36, 0.4)' }
};

// Tier badge component 
export const TierBadge = ({ tier, large = false }: { tier: string, large?: boolean }) => {
  const style = tierStyles[tier as keyof typeof tierStyles] || tierStyles.free;
  return (
    <div className={`flex items-center ${large ? 'text-lg font-bold' : 'text-xs'} ${style.color} ${style.bgColor} border-2 ${style.borderColor} rounded-full px-4 py-2 shadow-lg`}>
      <Crown className={`${large ? 'h-6 w-6' : 'h-3 w-3'} mr-2`} />
      {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
    </div>
  );
};

interface DashboardStats {
  totalScans: number;
  activeScans: number;
  completedScans: number;
  failedScans: number;
  totalVulnerabilities: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  subscription: {
    tier: string;
    usage: {
      dailyScans: number;
      monthlyScans: number;
      maxDailyScans: number;
      maxMonthlyScans: number;
    }
  }
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching dashboard stats...");
        const { data } = await axios.get('/api/zap/dashboard-stats');
        console.log("Dashboard stats received:", data);
        
        // Debug for subscription data
        if (data?.subscription) {
          console.log("Successfully loaded subscription data:", {
            tier: data.subscription.tier,
            dailyScans: data.subscription.usage.dailyScans,
            monthlyScans: data.subscription.usage.monthlyScans
          });
        } else {
          console.warn("No subscription data found in the response");
          console.log("Full response:", JSON.stringify(data));
        }
        
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Set up polling for real-time updates
    const interval = setInterval(fetchStats, 30000); // every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with plan badge prominently displayed in center */}
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-center">Dashboard</h1>
        
        {/* Current plan indicator - positioned prominently in center */}
        {stats?.subscription ? (
          <div className="mb-2 relative">
            <div className={`${fadeInAnimation} scale-110 hover:scale-125 cursor-help`} 
                title={`Your current plan: ${stats.subscription.tier}`}>
              <div className="absolute -inset-1 rounded-full blur-md opacity-50" 
                  style={{backgroundColor: tierStyles[stats.subscription.tier as keyof typeof tierStyles]?.glowColor}}></div>
              <TierBadge tier={stats.subscription.tier} large={true} />
            </div>
            {/* Debug info for easier test verification */}
            <div className="text-xs text-gray-500 mt-1 text-center opacity-75">
              Plan Active: {stats.subscription.tier}
            </div>
          </div>
        ) : (
          <div className="mb-2">
            <div className="text-gray-400 bg-gray-800/50 border border-gray-600 rounded-full px-4 py-2 animate-pulse">
              <span className="text-sm">Plan info loading...</span>
            </div>
          </div>
        )}
        
        <p className="text-gray-400 text-center mb-4">Monitor your security scans and subscription status</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scans">Scans</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-primary-medium/30 border-accent-blue/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-accent-blue" />
                  <div className="text-2xl font-bold">{stats?.totalScans || 0}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary-medium/30 border-accent-blue/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-blue-400" />
                  <div className="text-2xl font-bold">{stats?.activeScans || 0}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary-medium/30 border-accent-blue/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Detected Vulnerabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ShieldAlert className="mr-2 h-4 w-4 text-red-400" />
                  <div className="text-2xl font-bold">{stats?.totalVulnerabilities || 0}</div>
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-red-400">High: {stats?.highSeverity || 0}</span>
                  <span className="text-amber-400">Medium: {stats?.mediumSeverity || 0}</span>
                  <span className="text-green-400">Low: {stats?.lowSeverity || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary-medium/30 border-accent-blue/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                  <div className="capitalize text-lg font-bold">{stats?.subscription?.tier || 'Free'}</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {stats?.subscription?.usage.monthlyScans || 0} / {stats?.subscription?.usage.maxMonthlyScans || 0} monthly scans used
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription panel */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <ScanManager />
            </div>
            <div>
              <SubscriptionPanel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scans" className="mt-6">
          <ScanManager />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard; 