import { dietTypes } from "@/constants/recipe-form";
import { cuisineTypes, spiceLevels, cookingTimes, servingSizes, mealTypes, skillLevels, budgetOptions } from "@/constants/recipe-form";
import { z } from "zod";

// Define the enums based on the provided arrays and objects
export const MealTypeEnum = z.enum(mealTypes as [string, ...string[]]);
export const SkillLevelEnum = z.enum(skillLevels as [string, ...string[]]);
export const CookingTimeEnum = z.enum(cookingTimes as [string, ...string[]]);
export const ServingSizeEnum = z.enum(servingSizes as [string, ...string[]]);
export const CuisineTypeEnum = z.enum(cuisineTypes as [string, ...string[]]);
export const SpiceLevelEnum = z.enum(spiceLevels as [string, ...string[]]);
export const BudgetEnum = z.enum(budgetOptions as [string, ...string[]]);

// Create a union of all diet type options
const allDietOptions = [
  ...dietTypes.none.options,
  ...dietTypes.plantBased.options,
  ...dietTypes.healthRelated.options,
  ...dietTypes.religiousCultural.options,
  ...dietTypes.lifestyle.options,
];

export const DietaryTypeEnum = z.enum(
  allDietOptions.map(option => option.value) as [string, ...string[]]
);

// Define the main query schema
export const QuerySchema = z.object({
  mealType: MealTypeEnum,
  dietaryType: DietaryTypeEnum,
  allergies: z.string().optional(),
  cookingTime: CookingTimeEnum,
  skillLevel: SkillLevelEnum,
  servings: ServingSizeEnum,
  cuisineType: CuisineTypeEnum,
  spiceLevel: SpiceLevelEnum,
  specialNotes: z.string().optional(),
  budget: BudgetEnum,
});

// Define the type based on the schema
export type RecipeQuery = z.infer<typeof QuerySchema>;

// Export helper function to get all valid options for a field
export const getValidOptions = {
  mealTypes: Object.values(mealTypes),
  dietaryTypes: allDietOptions.map(option => ({
    value: option.value,
    label: option.label,
    category: Object.entries(dietTypes).find(([, group]) =>
      group.options.some(opt => opt.value === option.value)
    )?.[1].label
  })),
  skillLevels: Object.values(skillLevels),
  cookingTimes: Object.values(cookingTimes),
  servingSizes: Object.values(servingSizes),
  cuisineTypes: Object.values(cuisineTypes),
  spiceLevels: Object.values(spiceLevels),
  budgetOptions: Object.values(budgetOptions),
};

// Export function to validate recipe data
export const validateRecipeQuery = (data: unknown): RecipeQuery => {
  return QuerySchema.parse(data);
};