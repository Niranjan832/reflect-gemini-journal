
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Basic journaling features',
    features: ['Text journal entries', 'Basic prompts', 'Calendar view'],
  },
  {
    name: 'Premium',
    price: '$9.99',
    description: 'Enhanced media features',
    features: [
      'Everything in Free',
      'Image uploads',
      'Voice recordings',
      'Drawing tools',
      'Video attachments',
    ],
  },
  {
    name: 'Professional',
    price: '$19.99',
    description: 'Full publishing suite',
    features: [
      'Everything in Premium',
      'Blog publishing',
      'Custom domain',
      'SEO tools',
      'Analytics dashboard',
    ],
  },
];

const SubscriptionPlans = () => {
  const handleSubscribe = (plan: string) => {
    if (plan === 'Free') {
      return; // Already on free plan
    }
    // Implement Stripe checkout here
    console.log(`Subscribe to ${plan}`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className="relative flex flex-col">
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold">{plan.price}</span>
              {plan.price !== '$0' && <span className="text-sm">/month</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              className="w-full"
              variant={plan.name === 'Free' ? 'outline' : 'default'}
              onClick={() => handleSubscribe(plan.name)}
            >
              {plan.name === 'Free' ? 'Current Plan' : 'Subscribe'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
