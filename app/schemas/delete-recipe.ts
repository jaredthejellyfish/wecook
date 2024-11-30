import { z } from 'zod';

const DeleteRecipeSchema = z.object({
    recipeId: z.string(),
});

export type DeleteRecipe = z.infer<typeof DeleteRecipeSchema>;
export { DeleteRecipeSchema };