import { getAuth } from '@clerk/tanstack-start/server';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { CalendarDays, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { getWebRequest } from 'vinxi/http';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import {
  budgetOptions,
  cookingTimes,
  cuisineTypes,
  dietTypes,
  servingSizes,
  skillLevels,
  spiceLevels,
} from '@/constants/recipe-form';
import { db } from '@/db/db';
import { preferencesTable } from '@/db/schema';
import { useGenerateBatchRecipe } from '@/hooks/useGenerateBatchRecipe';

// Add type for template settings that matches the state type
type MealPlanSettings = {
  dietaryType: string;
  mealsPerDay: string;
  mealPreferences: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  };
  specialNotes?: string;
  leftoverPreference: 'none' | 'some' | 'lots';
};

const MEAL_PLAN_TEMPLATES: Record<
  string,
  { name: string; settings: MealPlanSettings }
> = {
  weightLoss: {
    name: 'Weight Loss',
    settings: {
      dietaryType: 'calorie_restricted',
      mealsPerDay: '5',
      mealPreferences: {
        breakfast: true,
        lunch: true,
        dinner: true,
        snacks: true,
      },
      specialNotes:
        'Focus on high-protein, low-calorie meals with plenty of vegetables.',
      leftoverPreference: 'some',
    },
  },
  muscleGain: {
    name: 'Muscle Gain',
    settings: {
      dietaryType: 'high_protein',
      mealsPerDay: '5',
      mealPreferences: {
        breakfast: true,
        lunch: true,
        dinner: true,
        snacks: true,
      },
      specialNotes:
        'High protein meals with complex carbohydrates. Focus on post-workout nutrition.',
      leftoverPreference: 'lots',
    },
  },
  familyFriendly: {
    name: 'Family Friendly',
    settings: {
      dietaryType: 'none',
      mealsPerDay: '3',
      mealPreferences: {
        breakfast: true,
        lunch: true,
        dinner: true,
        snacks: false,
      },
      specialNotes:
        'Kid-friendly meals that are easy to prepare. Include variety and balanced nutrition.',
      leftoverPreference: 'some',
    },
  },
  budgetConscious: {
    name: 'Budget Conscious',
    settings: {
      dietaryType: 'none',
      mealsPerDay: '3',
      mealPreferences: {
        breakfast: true,
        lunch: true,
        dinner: true,
        snacks: false,
      },
      specialNotes:
        'Focus on cost-effective ingredients and meals that can be batch cooked.',
      leftoverPreference: 'lots',
    },
  },
};

const preferencesByUserId = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const { userId } = await getAuth(getWebRequest());

      if (!userId) {
        throw redirect({
          to: '/',
        });
      }

      const data = await db
        .select()
        .from(preferencesTable)
        .where(eq(preferencesTable.userId, userId));

      if (!data.length) {
        const data = await db
          .insert(preferencesTable)
          .values({ userId })
          .returning();

        return { preferences: data[0] };
      }

      return { preferences: data[0] };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
);

export const Route = createFileRoute('/(app)/generate/plan/')({
  component: GeneratePlanPage,
  loader: () => preferencesByUserId(),
});

function GeneratePlanPage() {
  const { preferences } = Route.useLoaderData();
  const { mutation, planData, setPlanData, isSubmittable } =
    useGenerateBatchRecipe({
      preferences,
    });

  const handleInputChange = (field: string, value: string | boolean) => {
    setPlanData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMealPreferenceChange = (meal: string, value: boolean) => {
    setPlanData((prev) => ({
      ...prev,
      mealPreferences: {
        ...prev.mealPreferences,
        [meal]: value,
      },
    }));
  };

  const applyTemplate = (templateKey: keyof typeof MEAL_PLAN_TEMPLATES) => {
    const template = MEAL_PLAN_TEMPLATES[templateKey];
    setPlanData((prev) => ({
      ...prev,
      ...template.settings,
    }));
    toast.success(`Applied ${template.name} template`);
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Generate Meal Plan
          </h2>
          <p className="text-muted-foreground">
            Create a personalized meal plan based on your preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(MEAL_PLAN_TEMPLATES).map(([key, template]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() =>
                    applyTemplate(key as keyof typeof MEAL_PLAN_TEMPLATES)
                  }
                >
                  {template.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Duration and Basic Settings */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Number of Days</Label>
              <Select
                value={planData.numberOfDays}
                onValueChange={(value) =>
                  handleInputChange('numberOfDays', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="28">28 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Servings</Label>
              <Select
                value={planData.servings}
                onValueChange={(value) => handleInputChange('servings', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of servings" />
                </SelectTrigger>
                <SelectContent>
                  {servingSizes.map((size: string) => (
                    <SelectItem key={size} value={size.toLocaleLowerCase()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dietary Requirements and Restrictions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Dietary Requirements</Label>
              <Select
                value={planData.dietaryType}
                onValueChange={(value) =>
                  handleInputChange('dietaryType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select diet type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dietTypes).map(([key, group]) => (
                    <SelectGroup key={key}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.options.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toLocaleLowerCase()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Allergies/Restrictions</Label>
              <Input
                value={planData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="Enter ingredients to avoid"
              />
            </div>
          </div>

          {/* Meal Schedule */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Meal Types</Label>
              <div className="grid gap-4 sm:grid-cols-4">
                {Object.entries(planData.mealPreferences).map(
                  ([meal, enabled]) => (
                    <div key={meal} className="flex items-center space-x-2">
                      <Checkbox
                        id={meal}
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          handleMealPreferenceChange(meal, checked as boolean)
                        }
                      />
                      <Label htmlFor={meal} className="capitalize">
                        {meal}
                      </Label>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Cooking Preferences */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cooking Time</Label>
              <Select
                value={planData.cookingTime}
                onValueChange={(value) =>
                  handleInputChange('cookingTime', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cooking time" />
                </SelectTrigger>
                <SelectContent>
                  {cookingTimes.map((time: string) => (
                    <SelectItem key={time} value={time.toLocaleLowerCase()}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Skill Level</Label>
              <Select
                value={planData.skillLevel}
                onValueChange={(value) =>
                  handleInputChange('skillLevel', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level: string) => (
                    <SelectItem key={level} value={level.toLocaleLowerCase()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Preferences */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Weekend Cooking</Label>
              <Select
                value={planData.weekendCooking}
                onValueChange={(value) =>
                  handleInputChange('weekendCooking', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Weekend cooking preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">Same as weekdays</SelectItem>
                  <SelectItem value="more">More elaborate meals</SelectItem>
                  <SelectItem value="less">Simpler meals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Leftovers Preference</Label>
              <Select
                value={planData.leftoverPreference}
                onValueChange={(value) =>
                  handleInputChange('leftoverPreference', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Leftover preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No leftovers</SelectItem>
                  <SelectItem value="some">Some leftovers</SelectItem>
                  <SelectItem value="lots">Lots of leftovers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Food Preferences */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Cuisine Preferences</Label>
              <Select
                value={planData.cuisinePreferences}
                onValueChange={(value) =>
                  handleInputChange('cuisinePreferences', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine preferences" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map((cuisine) => (
                    <SelectItem
                      key={cuisine}
                      value={cuisine.toLocaleLowerCase()}
                    >
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Spice Level</Label>
              <Select
                value={planData.spiceLevel}
                onValueChange={(value) =>
                  handleInputChange('spiceLevel', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select spice level" />
                </SelectTrigger>
                <SelectContent>
                  {spiceLevels.map((level) => (
                    <SelectItem key={level} value={level.toLocaleLowerCase()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Budget</Label>
              <Select
                value={planData.budget}
                onValueChange={(value) => handleInputChange('budget', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={planData.specialNotes}
              onChange={(e) =>
                handleInputChange('specialNotes', e.target.value)
              }
              placeholder="Any additional preferences or requirements?"
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => mutation.mutate()}
              className="w-full sm:w-auto"
              disabled={!isSubmittable || mutation.isPending}
            >
              <div className="flex items-center justify-center">
                {mutation.isPending && (
                  <div className="mr-2">
                    <LoadingSpinner />
                  </div>
                )}
                {mutation.isPending
                  ? 'Generating Plan...'
                  : 'Generate Meal Plan'}
                {!mutation.isPending && (
                  <CalendarDays className="ml-2 h-4 w-4" />
                )}
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
