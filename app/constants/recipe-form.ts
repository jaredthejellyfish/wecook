

export const dietTypes = {
  none: {
    label: 'Standard',
    options: [{ value: 'none', label: 'None' }, { value: 'high_protein', label: 'High Protein' }, { value: 'low_carb', label: 'Low Carb' }, { value: 'calorie_restricted', label: 'Calorie Restricted' }],
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

export const mealTypes = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack'];
export const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
export const cookingTimes = [
  '15 minutes',
  '30 minutes',
  '45 minutes',
  '1 hour',
  '1+ hours',
];
export const servingSizes = ['1', '2', '3-4', '5-6', '7+'];
export const cuisineTypes = [
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
export const spiceLevels = ['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'];
export const budgetOptions = ['$', '$$', '$$$', '$$$$'];

export type RecipeData = {
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

export const initialRecipeData: RecipeData = {
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


