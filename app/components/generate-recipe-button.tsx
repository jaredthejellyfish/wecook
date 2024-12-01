import { useEffect, useState } from 'react';

import { Label } from '@radix-ui/react-dropdown-menu';
import { useRouter } from '@tanstack/react-router';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

import { usePreferences } from '@/hooks/usePreferences';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';

const dietTypes = {
  none: {
    label: 'Standard',
    options: [{ value: 'none', label: 'None' }],
  },
  plantBased: {
    label: 'Plant-Based Diets',
    options: [
      { value: 'vegan', label: 'Vegan' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'pescatarian', label: 'Pescatarian' },
      { value: 'flexitarian', label: 'Flexitarian' },
    ],
  },
  healthRelated: {
    label: 'Health-Related Diets',
    options: [
      { value: 'gluten-free', label: 'Gluten-Free' },
      { value: 'low-fodmap', label: 'Low-FODMAP' },
      { value: 'keto', label: 'Ketogenic' },
      { value: 'diabetic', label: 'Diabetic' },
      { value: 'low-sodium', label: 'Low-Sodium' },
    ],
  },
  religiousCultural: {
    label: 'Religious & Cultural',
    options: [
      { value: 'kosher', label: 'Kosher' },
      { value: 'halal', label: 'Halal' },
      { value: 'hindu-veg', label: 'Hindu Vegetarian' },
    ],
  },
  lifestyle: {
    label: 'Lifestyle Diets',
    options: [
      { value: 'mediterranean', label: 'Mediterranean' },
      { value: 'paleo', label: 'Paleo' },
      { value: 'raw', label: 'Raw Food' },
      { value: 'whole30', label: 'Whole30' },
      { value: 'dash', label: 'DASH' },
      { value: 'macrobiotic', label: 'Macrobiotic' },
    ],
  },
};

const mealTypes = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack'];
const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
const cookingTimes = [
  '15 minutes',
  '30 minutes',
  '45 minutes',
  '1 hour',
  '1+ hours',
];
const servingSizes = ['1', '2', '3-4', '5-6', '7+'];
const cuisineTypes = [
  'Italian',
  'Mexican',
  'Thai',
  'Indian',
  'Chinese',
  'Japanese',
  'Mediterranean',
  'American',
  'French',
];
const spiceLevels = ['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'];
const budgetOptions = ['$', '$$', '$$$', '$$$$'];

type RecipeData = {
  mealType: string;
  dietaryType: string;
  allergies: string;
  cookingTime: string;
  skillLevel: string;
  servings: string;
  cuisineType: string;
  spiceLevel: string;
  specialNotes: string;
  budget: string;
};

const initialRecipeData: RecipeData = {
  mealType: '',
  dietaryType: '',
  allergies: '',
  cookingTime: '',
  skillLevel: '',
  servings: '',
  cuisineType: '',
  spiceLevel: '',
  specialNotes: '',
  budget: '',
};

const generateSearchParams = (recipeData: RecipeData) => {
  return new URLSearchParams({
    mealType: recipeData.mealType,
    dietaryType: recipeData.dietaryType,
    allergies: recipeData.allergies,
    cookingTime: recipeData.cookingTime,
    skillLevel: recipeData.skillLevel,
    servings: recipeData.servings,
    cuisineType: recipeData.cuisineType,
    spiceLevel: recipeData.spiceLevel,
    specialNotes: recipeData.specialNotes,
    budget: recipeData.budget,
  });
};

function GenerateRecipeButton() {
  const { data: preferences } = usePreferences();
  const [recipeData, setRecipeData] = useState<RecipeData>(initialRecipeData);

  useEffect(() => {
    setRecipeData({
      mealType: '',
      dietaryType: preferences?.dietaryType ?? '',
      allergies: preferences?.allergies ?? '',
      cookingTime: preferences?.cookingTime ?? '',
      skillLevel: preferences?.skillLevel ?? '',
      servings: preferences?.servings ?? '',
      cuisineType: preferences?.cuisineType ?? '',
      spiceLevel: preferences?.spiceLevel ?? '',
      specialNotes: preferences?.specialNotes ?? '',
      budget: preferences?.budget ?? '',
    });
  }, [preferences]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isFormValid = Object.entries(recipeData).every(([key, value]) =>
    key === 'specialNotes' || key === 'allergies' ? true : value !== '',
  );

  async function handleGenerateRecipe() {
    try {
      setLoading(true);
      setOpen(false);
      const url = `/api/recipes/generate-recipe?${generateSearchParams(recipeData).toString()}`;

      const response = await fetch(url);
      const data = (await response.json()) as {
        success: boolean;
        data: { id: string; publicAccessToken: string };
      };

      if (data.success) {
        router.navigate({
          to: '/generating',
          search: {
            publicAccessToken: data.data.publicAccessToken,
            recipeId: data.data.id,
          },
        });
      } else {
        toast.error('Failed to generate recipe');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary" size="lg">
          {!loading && <PlusCircle className="mr-2 h-5 w-5" />}
          {loading && (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          )}
          {loading ? 'Generating recipe...' : 'Plan a meal'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate a Recipe</DialogTitle>
          <DialogDescription>
            Tell us your preferences to generate a personalized recipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Meal Type</Label>
            <Select
              value={recipeData?.mealType}
              onValueChange={(value) =>
                setRecipeData((prev) => ({ ...prev, mealType: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a meal" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Meals</SelectLabel>
                  {mealTypes.map((meal) => (
                    <SelectItem key={meal} value={meal.toLowerCase()}>
                      {meal}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Dietary Requirements</Label>
            <Select
              value={recipeData?.dietaryType}
              onValueChange={(value) =>
                setRecipeData((prev) => ({ ...prev, dietaryType: value }))
              }
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a diet type" />
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

          {/* Allergies and Restrictions */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Allergies/Avoid</Label>
            <Input
              className="col-span-3"
              value={recipeData?.allergies}
              onChange={(e) =>
                setRecipeData((prev) => ({
                  ...prev,
                  allergies: e.target.value,
                }))
              }
              placeholder="Enter ingredients to avoid, separated by commas"
            />
          </div>

          {/* Cooking Parameters */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Cooking Time</Label>
            <Select
              value={recipeData?.cookingTime}
              onValueChange={(value) =>
                setRecipeData((prev) => ({ ...prev, cookingTime: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Available time" />
              </SelectTrigger>
              <SelectContent>
                {cookingTimes.map((time) => (
                  <SelectItem key={time} value={time.toLowerCase()}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Skill Level</Label>
            <Select
              value={recipeData?.skillLevel}
              onValueChange={(value) =>
                setRecipeData((prev) => ({ ...prev, skillLevel: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cooking experience" />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((level) => (
                  <SelectItem key={level} value={level.toLowerCase()}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Servings</Label>
            <Select
              value={recipeData?.servings}
              onValueChange={(value) =>
                setRecipeData((prev) => ({ ...prev, servings: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Number of servings" />
              </SelectTrigger>
              <SelectContent>
                {servingSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Cuisine Type</Label>
            <Select
              value={recipeData?.cuisineType}
              onValueChange={(value) =>
                setRecipeData((prev) => ({ ...prev, cuisineType: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                {cuisineTypes.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Spice Level</Label>
            <Select
              value={recipeData?.spiceLevel}
              onValueChange={(value) =>
                setRecipeData((prev) => ({ ...prev, spiceLevel: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Spice preference" />
              </SelectTrigger>
              <SelectContent>
                {spiceLevels.map((level) => (
                  <SelectItem key={level} value={level.toLowerCase()}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Special Notes</Label>
            <Textarea
              className="col-span-3"
              value={recipeData?.specialNotes}
              onChange={(e) =>
                setRecipeData((prev) => ({
                  ...prev,
                  specialNotes: e.target.value,
                }))
              }
              placeholder="Any additional preferences or requirements?"
            />
          </div>

          {/* Budget */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Budget</Label>
            <Select
              value={recipeData?.budget}
              onValueChange={(value) =>
                setRecipeData((prev) => ({ ...prev, budget: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
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

        <DialogFooter>
          <Button
            type="submit"
            disabled={!isFormValid}
            onClick={handleGenerateRecipe}
          >
            Generate Recipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateRecipeButton;
