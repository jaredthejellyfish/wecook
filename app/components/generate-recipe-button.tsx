import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

import { usePreferences } from '@/hooks/usePreferences';
import { LoadingSpinner } from './ui/loading-spinner';
import {
  dietTypes,
  mealTypes,
  skillLevels,
  cookingTimes,
  servingSizes,
  cuisineTypes,
  spiceLevels,
  budgetOptions,
  initialRecipeData,
} from '@/constants/recipe-form';

import { Label } from '@radix-ui/react-dropdown-menu';
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';
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

function GenerateRecipeButton() {
  const { data: preferences } = usePreferences();
  const [recipeData, setRecipeData] = useState(initialRecipeData);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!preferences) return;
    
    setRecipeData(prev => ({
      ...prev,
      dietaryType: preferences.dietaryType ?? '',
      allergies: preferences.allergies ?? '',
      cookingTime: preferences.cookingTime ?? '',
      skillLevel: preferences.skillLevel ?? '',
      servings: preferences.servings ?? '',
      cuisineType: preferences.cuisineType ?? '',
      spiceLevel: preferences.spiceLevel ?? '',
      specialNotes: preferences.specialNotes ?? '',
      budget: preferences.budget ?? '',
    }));
  }, [preferences]);

  const isFormValid = useMemo(() => 
    Object.entries(recipeData).every(([key, value]) =>
      key === 'specialNotes' || key === 'allergies' ? true : value !== ''
    ), [recipeData]);

  const generateSearchParams = useCallback((data: Record<string, string>) => {
    return new URLSearchParams(data);
  }, []);

  const handleGenerateRecipe = useCallback(async () => {
    try {
      setLoading(true);
      setOpen(false);
      
      const url = `/api/recipes/generate?${generateSearchParams(recipeData)}`;
      const response = await fetch(url);
      const data = await response.json();

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
      toast.error('An error occurred while generating the recipe');
    } finally {
      setLoading(false);
    }
  }, [recipeData, router, generateSearchParams]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setRecipeData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <>
      <div className="w-full hidden md:block">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary" size="lg">
              {!loading && <PlusCircle className="mr-2 h-5 w-5" />}
              {loading && <LoadingSpinner />}
              {loading ? 'Generating recipe...' : 'Plan a meal'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-screen overflow-scroll">
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
                    handleInputChange('mealType', value)
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

              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Dietary Requirements</Label>
                <Select
                  value={recipeData?.dietaryType}
                  onValueChange={(value) =>
                    handleInputChange('dietaryType', value)
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
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Allergies/Avoid</Label>
                <Input
                  className="col-span-3"
                  value={recipeData?.allergies}
                  onChange={(e) =>
                    handleInputChange('allergies', e.target.value)
                  }
                  placeholder="Enter ingredients to avoid, separated by commas"
                />
              </div>

              {/* Cooking Parameters */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Cooking Time</Label>
                <Select
                  value={recipeData?.cookingTime}
                  onValueChange={(value) =>
                    handleInputChange('cookingTime', value)
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

              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Skill Level</Label>
                <Select
                  value={recipeData?.skillLevel}
                  onValueChange={(value) =>
                    handleInputChange('skillLevel', value)
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

              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Servings</Label>
                <Select
                  value={recipeData?.servings}
                  onValueChange={(value) =>
                    handleInputChange('servings', value)
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
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Cuisine Type</Label>
                <Select
                  value={recipeData?.cuisineType}
                  onValueChange={(value) =>
                    handleInputChange('cuisineType', value)
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

              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Spice Level</Label>
                <Select
                  value={recipeData?.spiceLevel}
                  onValueChange={(value) =>
                    handleInputChange('spiceLevel', value)
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
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Special Notes</Label>
                <Textarea
                  className="col-span-3"
                  value={recipeData?.specialNotes}
                  onChange={(e) =>
                    handleInputChange('specialNotes', e.target.value)
                  }
                  placeholder="Any additional preferences or requirements?"
                />
              </div>

              {/* Budget */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Budget</Label>
                <Select
                  value={recipeData?.budget}
                  onValueChange={(value) =>
                    handleInputChange('budget', value)
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
      </div>
      <div className="w-full md:hidden md:pointer-events-none">
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="w-full bg-primary" size="lg">
              {!loading && <PlusCircle className="mr-2 h-5 w-5" />}
              {loading && <LoadingSpinner />}
              {loading ? 'Generating recipe...' : 'Plan a meal'}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh]">
            <div className="grid gap-4 overflow-scroll p-6">
              <DrawerHeader>
                <DrawerTitle>Generate a Recipe</DrawerTitle>
                <DrawerDescription>
                  Tell us your preferences to generate a personalized recipe.
                </DrawerDescription>
              </DrawerHeader>

              {/* Basic Information */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Meal Type</Label>
                <Select
                  value={recipeData?.mealType}
                  onValueChange={(value) =>
                    handleInputChange('mealType', value)
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

              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Dietary Requirements</Label>
                <Select
                  value={recipeData?.dietaryType}
                  onValueChange={(value) =>
                    handleInputChange('dietaryType', value)
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
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Allergies/Avoid</Label>
                <Input
                  className="col-span-3"
                  value={recipeData?.allergies}
                  onChange={(e) =>
                    handleInputChange('allergies', e.target.value)
                  }
                  placeholder="Enter ingredients to avoid, separated by commas"
                />
              </div>

              {/* Cooking Parameters */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Cooking Time</Label>
                <Select
                  value={recipeData?.cookingTime}
                  onValueChange={(value) =>
                    handleInputChange('cookingTime', value)
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

              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Skill Level</Label>
                <Select
                  value={recipeData?.skillLevel}
                  onValueChange={(value) =>
                    handleInputChange('skillLevel', value)
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

              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Servings</Label>
                <Select
                  value={recipeData?.servings}
                  onValueChange={(value) =>
                    handleInputChange('servings', value)
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
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Cuisine Type</Label>
                <Select
                  value={recipeData?.cuisineType}
                  onValueChange={(value) =>
                    handleInputChange('cuisineType', value)
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

              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Spice Level</Label>
                <Select
                  value={recipeData?.spiceLevel}
                  onValueChange={(value) =>
                    handleInputChange('spiceLevel', value)
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
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Special Notes</Label>
                <Textarea
                  className="col-span-3"
                  value={recipeData?.specialNotes}
                  onChange={(e) =>
                    handleInputChange('specialNotes', e.target.value)
                  }
                  placeholder="Any additional preferences or requirements?"
                />
              </div>

              {/* Budget */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right">Budget</Label>
                <Select
                  value={recipeData?.budget}
                  onValueChange={(value) =>
                    handleInputChange('budget', value)
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

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button
                    type="submit"
                    disabled={!isFormValid}
                    onClick={handleGenerateRecipe}
                  >
                    Generate Recipe
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

export default GenerateRecipeButton;
