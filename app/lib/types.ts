export interface CalendarEvent {
  id: number;
  date: Date;
  mealType: string;
  userId: string;
  recipeId: number;
  recipeTitle?: string;
  recipeImage?: string;
  recipeDescription?: string;
}
export type MealType = 'breakfast' | 'brunch' | 'lunch' | 'snack' | 'dinner';

export type RecentActivity = {
  id: string;
  type: 'cooked' | 'saved';
  title: string;
  image: string;
  description: string;
};