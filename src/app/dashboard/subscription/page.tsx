
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Check, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PlanFeature = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-center gap-3">
        <Check className="h-5 w-5 text-primary" />
        <span className="text-muted-foreground">{children}</span>
    </li>
);

export default function SubscriptionPage() {
    const { user, loading } = useAuth();

    const currentPlanId = user?.subscription?.planId || 'free';
    const planExpiry = user?.subscription?.endDate;

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: '0',
            priceDescription: 'per month',
            description: 'For individuals and small teams just getting started.',
            features: [
                'Up to 10 products',
                'Basic analytics',
                'Standard support',
            ],
            isCurrent: currentPlanId === 'free',
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '540',
            priceDescription: 'per year',
            description: 'For growing businesses that need more power and features.',
            features: [
                'Unlimited products',
                'Enhanced analytics',
                'WhatsApp notifications',
                'Priority support',
            ],
            isCurrent: currentPlanId === 'pro',
        },
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
             <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
                <p className="text-muted-foreground mt-2">Choose the plan that's right for your business.</p>
            </div>

            {currentPlanId === 'pro' && planExpiry && (
                 <Card className="max-w-2xl mx-auto bg-green-50 border-green-200">
                    <CardHeader className="text-center">
                        <CardTitle className="text-green-800">You are on the Pro Plan!</CardTitle>
                        <CardDescription className="text-green-700">
                            Your subscription is active until {format(planExpiry, 'PPP')}.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {plans.map((plan) => (
                    <Card key={plan.id} className={cn("flex flex-col", plan.isCurrent && "border-primary ring-2 ring-primary")}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                {plan.isCurrent && <div className="flex items-center gap-1 text-xs font-semibold text-primary"><Star className="h-4 w-4 fill-primary" /> Current Plan</div>}
                            </div>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">GHS {plan.price}</span>
                                <span className="text-muted-foreground">{plan.priceDescription}</span>
                            </div>
                            <ul className="space-y-3">
                                {plan.features.map((feature, i) => (
                                    <PlanFeature key={i}>{feature}</PlanFeature>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                size="lg" 
                                className="w-full" 
                                disabled={plan.isCurrent}
                            >
                                {plan.isCurrent ? 'Your Current Plan' : (plan.id === 'pro' ? 'Upgrade to Pro' : 'Downgrade')}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
