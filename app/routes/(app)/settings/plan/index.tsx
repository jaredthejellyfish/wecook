import { useState } from 'react';

import { getAuth } from '@clerk/tanstack-start/server';
import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { Check } from 'lucide-react';
import { getWebRequest } from 'vinxi/http';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { db } from '@/db/db';
import { recipesTable } from '@/db/schema';
import { cn } from '@/lib/utils';
import { transformDbRecord } from '@/schemas/recipe';
import authStateFn from '@/server-fns/auth-redirect';

const recipesByUserId = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await getAuth(getWebRequest());

  if (!userId) {
    // This will error because you're redirecting to a path that doesn't exist yet
    // You can create a sign-in route to handle this
    throw redirect({
      to: '/',
    });
  }

  const data = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.userId, userId));

  const transformedRecipes = [];

  for (const recipe of data) {
    const transformedRecipe = transformDbRecord(recipe);
    transformedRecipes.push(transformedRecipe);
  }

  return { recipes: transformedRecipes };
});

export const Route = createFileRoute('/(app)/settings/plan/')({
  component: SettingsPlanPage,
  beforeLoad: () => authStateFn(),
  loader: () => recipesByUserId(),
});

const plans = [
  {
    name: 'Hobby',
    description: 'For personal use',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: ['5 recipes', 'Basic meal planning', 'Community support'],
  },
  {
    name: 'Pro',
    description: 'For serious home cooks',
    price: {
      monthly: 9.99,
      yearly: 99.99,
    },
    features: [
      'Unlimited recipes',
      'Advanced meal planning',
      'Priority support',
      'Nutritional analysis',
    ],
    popular: true,
  },
  {
    name: 'Chef',
    description: 'For professional chefs',
    price: {
      monthly: 29.99,
      yearly: 299.99,
    },
    features: [
      'All Pro features',
      'Recipe scaling',
      'Inventory management',
      'Team collaboration',
    ],
  },
];

function SettingsPlanPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>(
    'monthly',
  );

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
          <p className="text-muted-foreground">
            Choose the perfect plan for your cooking needs
          </p>
        </div>
      </div>

      <Tabs
        value={billingInterval}
        onValueChange={(value) =>
          setBillingInterval(value as 'monthly' | 'yearly')
        }
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="monthly">Monthly billing</TabsTrigger>
          <TabsTrigger value="yearly">Yearly billing</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn('relative flex flex-col justify-between', plan.popular ? 'border-primary' : '')}
          >
            {plan.popular && (
              <Badge className="absolute top-4 right-4" variant="secondary">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                $
                {billingInterval === 'monthly'
                  ? plan.price.monthly.toFixed(2)
                  : plan.price.yearly.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{billingInterval === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingInterval === 'yearly' && (
                <p className="text-sm text-muted-foreground mb-4">
                  Billed annually (save{' '}
                  {(plan.price.monthly * 12 - plan.price.yearly).toFixed(2)})
                </p>
              )}
              <Separator className="my-4" />
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                asChild
              >
                <Link
                  to={`/settings/plan/$planId`}
                  params={{ planId: plan.name.toLocaleLowerCase() }}
                >
                  More Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        All plans include a 14-day free trial. No credit card required.
      </div>
    </>
  );
}
