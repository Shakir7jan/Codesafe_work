import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '5 free spider scans',
      '5 active scans',
      'Basic security reports',
      'Community support'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'default',
    scanLimit: 5
  },
  {
    name: 'Standard',
    price: '$29',
    description: 'For growing businesses',
    features: [
      'Unlimited spider scans',
      '20 active scans',
      'Advanced security reports',
      'Priority support',
      'API access',
      'Custom scan configurations'
    ],
    buttonText: 'Upgrade to Standard',
    buttonVariant: 'outline',
    scanLimit: 20
  },
  {
    name: 'Premium',
    price: '$99',
    description: 'For enterprise needs',
    features: [
      'Unlimited spider scans',
      'Unlimited active scans',
      'Enterprise security reports',
      '24/7 dedicated support',
      'API access',
      'Custom scan configurations',
      'Team management',
      'Advanced analytics'
    ],
    buttonText: 'Upgrade to Premium',
    buttonVariant: 'outline',
    scanLimit: -1 // unlimited
  }
];

export default function Billing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleTierSelect = (tierName: string) => {
    setSelectedTier(tierName);
    // Store the selected tier in localStorage or your backend
    localStorage.setItem('selectedTier', tierName);
    // Redirect to dashboard after selection
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-primary-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Select the perfect plan for your security needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${
                selectedTier === tier.name
                  ? 'border-accent-blue shadow-lg shadow-accent-blue/20'
                  : 'border-accent-blue/20'
              } bg-primary-medium/50`}
            >
              <CardHeader>
                <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.price !== '$0' && <span className="text-gray-400">/month</span>}
                </div>
                <CardDescription className="text-gray-400 mt-2">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-accent-blue mr-2 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    tier.buttonVariant === 'default'
                      ? 'bg-accent-blue hover:bg-accent-blue-dark'
                      : 'border-accent-blue text-accent-blue hover:bg-accent-blue/10'
                  }`}
                  onClick={() => handleTierSelect(tier.name)}
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 