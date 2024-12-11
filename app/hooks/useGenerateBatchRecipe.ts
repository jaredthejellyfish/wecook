import { BudgetEnum, CookingTimeEnum, CuisineTypeEnum, ServingSizeEnum, SkillLevelEnum, SpiceLevelEnum } from "@/schemas/query-schema";

import { DietaryTypeEnum } from '@/schemas/query-schema';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { SelectPreference } from '@/db/schema';
import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";

const MealPlanGenerationSchema = z.object({
    numberOfDays: z.enum(['3', '5', '7', '14', '28']),
    dietaryType: DietaryTypeEnum,
    allergies: z.string().max(255).optional(),
    cookingTime: CookingTimeEnum,
    skillLevel: SkillLevelEnum,
    servings: ServingSizeEnum,
    spiceLevel: SpiceLevelEnum,
    budget: BudgetEnum,
    cuisinePreferences: CuisineTypeEnum,
    mealPreferences: z.object({
        breakfast: z.boolean(),
        lunch: z.boolean(),
        dinner: z.boolean(),
        snacks: z.boolean(),
    }),
    weekendCooking: z.enum(['same', 'more', 'less']),
    leftoverPreference: z.enum(['none', 'some', 'lots']),
    specialNotes: z.string().max(255).optional(),
});

export function useGenerateBatchRecipe({ preferences }: { preferences: SelectPreference }) {
    const router = useRouter()

    const [planData, setPlanData] = useState({
        numberOfDays: '',
        dietaryType: preferences?.dietaryType ?? '',
        allergies: preferences?.allergies ?? '',
        cookingTime: preferences?.cookingTime ?? '',
        skillLevel: preferences?.skillLevel ?? '',
        servings: preferences?.servings ?? '',
        cuisinePreferences: preferences?.cuisineType ?? '',
        spiceLevel: preferences?.spiceLevel ?? '',
        budget: preferences?.budget ?? '',
        specialNotes: preferences?.specialNotes ?? '',
        mealPreferences: {
            breakfast: false,
            lunch: false,
            dinner: false,
            snacks: false,
        },
        weekendCooking: '',
        leftoverPreference: '',
    });

    const mutation = useMutation({
        mutationFn: async () => {

            const validatedData = MealPlanGenerationSchema.parse(planData);
            const response = await fetch('/api/meal-plan/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validatedData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update preferences');
            }

            const data = await response.json();
            return data.preferences as {
                batchId: string;
                publicAccessToken: string;
            };
        },
        onSuccess: (data) => {
            router.navigate({
                to: '/generating/batch',
                search: {
                    batchId: data.batchId,
                    publicAccessToken: data.publicAccessToken,
                },
            })
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });


    const isSubmittable = useMemo(() => {
        const result = MealPlanGenerationSchema.safeParse(planData);
        console.log('result', result);
        return result.success;
    }, [planData]);

    return { mutation, planData, setPlanData, isSubmittable };
} 