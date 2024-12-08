import { useState } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { CalendarDays, Filter } from 'lucide-react';
import { toast } from 'sonner';

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
  cuisineTypes,
  dietTypes,
  spiceLevels,
} from '@/constants/recipe-form';
import { usePreferences } from '@/hooks/usePreferences';

const MEAL_PLAN_TEMPLATES = {
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

export const Route = createFileRoute('/(app)/generate/plan/')({
  component: GeneratePlanPage,
});

function GeneratePlanPage() {
  const { data: preferences } = usePreferences();
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState({
    numberOfDays: '7',
    mealsPerDay: '3',
    dietaryType: preferences?.dietaryType ?? 'none',
    allergies: preferences?.allergies ?? '',
    cookingTime: preferences?.cookingTime ?? '30 minutes',
    skillLevel: preferences?.skillLevel ?? 'Beginner',
    servings: preferences?.servings ?? '2',
    cuisinePreferences: preferences?.cuisineType ?? '',
    spiceLevel: preferences?.spiceLevel ?? 'Medium',
    budget: preferences?.budget ?? '$$',
    specialNotes: preferences?.specialNotes ?? '',
    mealPreferences: {
      breakfast: true,
      lunch: true,
      dinner: true,
      snacks: false,
    },
    weekendCooking: 'same', // 'same', 'more', 'less'
    leftoverPreference: 'some', // 'none', 'some', 'lots'
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

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);

      const requestData = {
        ...planData,
        cuisinePreferences: Array.isArray(planData.cuisinePreferences)
          ? planData.cuisinePreferences.join(',')
          : planData.cuisinePreferences,
      };

      console.log('requestData', requestData);

      const response = await fetch('/api/meal-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('data', data);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while generating the meal plan');
    } finally {
      setLoading(false);
    }
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
          {/* Basic Plan Settings */}
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
              <Label>Meals per Day</Label>
              <Select
                value={planData.mealsPerDay}
                onValueChange={(value) =>
                  handleInputChange('mealsPerDay', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meals per day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 meal</SelectItem>
                  <SelectItem value="2">2 meals</SelectItem>
                  <SelectItem value="3">3 meals</SelectItem>
                  <SelectItem value="4">4 meals</SelectItem>
                  <SelectItem value="5">5 meals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dietary Preferences */}
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
                        <SelectItem key={option.value} value={option.value}>
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

          {/* Meal Preferences */}
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

          {/* Additional Preferences */}
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

          <div className="space-y-2">
            <Label>Cuisine Preferences</Label>
            <Select
              value={planData.cuisinePreferences ?? ''}
              onValueChange={(value) =>
                handleInputChange('cuisinePreferences', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine preferences">
                  {Array.isArray(planData.cuisinePreferences)
                    ? planData.cuisinePreferences.join(', ')
                    : planData.cuisinePreferences}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cuisineTypes.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                    <SelectItem key={level} value={level}>
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

          {/* Notes */}
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

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <div className="flex items-center justify-center">
                {loading && (
                  <div className="mr-2">
                    <LoadingSpinner />
                  </div>
                )}
                {loading ? 'Generating Plan...' : 'Generate Meal Plan'}
                {!loading && <CalendarDays className="ml-2 h-4 w-4" />}
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
