import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Check, ChevronRight, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import authStateFn from '@/server-fns/auth-redirect'

export const Route = createFileRoute('/(app)/settings/plan/$planId/')({
  component: PlanDetailsPage,
  beforeLoad: () => authStateFn(),
})

const plans = {
  hobby: {
    name: 'Hobby',
    description:
      'Perfect for personal use and small-scale cooking enthusiasts.',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      { name: '5 recipes', included: true },
      { name: 'Basic meal planning', included: true },
      { name: 'Community support', included: true },
      { name: 'Recipe scaling', included: false },
      { name: 'Nutritional analysis', included: false },
      { name: 'Priority support', included: false },
    ],
    details: [
      'Access to a curated selection of 5 recipes',
      'Simple meal planning tools for weekly organization',
      'Join our community forum for tips and advice',
      'Perfect for individuals or small families',
      'Ideal for those new to digital recipe management',
    ],
  },
  pro: {
    name: 'Pro',
    description:
      'Designed for serious home cooks who want to elevate their culinary game.',
    price: {
      monthly: 9.99,
      yearly: 99.99,
    },
    features: [
      { name: 'Unlimited recipes', included: true },
      { name: 'Advanced meal planning', included: true },
      { name: 'Priority support', included: true },
      { name: 'Nutritional analysis', included: true },
      { name: 'Recipe scaling', included: false },
      { name: 'Inventory management', included: false },
    ],
    details: [
      'Unlimited recipe storage and organization',
      'Advanced meal planning with customizable calendars',
      'Detailed nutritional information for all recipes',
      'Priority customer support via email and chat',
      'Ideal for food bloggers and passionate home cooks',
      'Access to exclusive pro-level recipes and techniques',
    ],
  },
  chef: {
    name: 'Chef',
    description:
      'The ultimate solution for professional chefs and culinary businesses.',
    price: {
      monthly: 29.99,
      yearly: 299.99,
    },
    features: [
      { name: 'All Pro features', included: true },
      { name: 'Recipe scaling', included: true },
      { name: 'Inventory management', included: true },
      { name: 'Team collaboration', included: true },
      { name: 'API access', included: true },
      { name: 'White-label option', included: true },
    ],
    details: [
      'Seamless recipe scaling for any party size',
      'Comprehensive inventory management system',
      'Collaborative tools for team recipe development',
      'API access for integration with other kitchen management tools',
      'White-label option for branded recipe platforms',
      'Ideal for restaurants, catering services, and culinary schools',
      '24/7 dedicated support for business accounts',
    ],
  },
}

function PlanDetailsPage() {
  const { planId } = Route.useParams()
  const plan = plans[planId as keyof typeof plans]

  if (!plan) {
    return <div>Plan not found</div>
  }

  return (
    <>
      <div className="flex items-center gap-2 text-md">
        <Link
          to={'/settings/plan'}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          Plans
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground font-medium">{plan.name}</span>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold tracking-tight">
            {plan.name} Plan
          </h1>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly">Monthly billing</TabsTrigger>
              <TabsTrigger value="yearly">Yearly billing</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly">
              <div className="text-4xl font-bold mt-4">
                ${plan.price.monthly.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
            </TabsContent>
            <TabsContent value="yearly">
              <div className="text-4xl font-bold mt-4">
                ${plan.price.yearly.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">
                  /year
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Save ${(plan.price.monthly * 12 - plan.price.yearly).toFixed(2)}{' '}
                annually
              </p>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Features</h3>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-center">
                    {feature.included ? (
                      <Check className="w-5 h-5 mr-2 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 mr-2 text-red-500" />
                    )}
                    <span
                      className={
                        feature.included ? '' : 'text-muted-foreground'
                      }
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Plan Details</h3>
              <ul className="space-y-2">
                {plan.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-1" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Choose {plan.name} Plan</Button>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        All plans include a 14-day free trial. No credit card required.
      </div>
    </>
  )
}
