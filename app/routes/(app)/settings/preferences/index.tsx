import { useState } from 'react';

import { getAuth } from '@clerk/tanstack-start/server';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { motion } from 'motion/react';
import { getWebRequest } from 'vinxi/http';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { type SelectPreference, preferencesTable } from '@/db/schema';
import { useMutatePreferences } from '@/hooks/useMutatePreferences';
import authStateFn from '@/server-fns/auth-redirect';

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

export const Route = createFileRoute('/(app)/settings/preferences/')({
  component: PreferencesPage,
  beforeLoad: () => authStateFn(),
  loader: () => preferencesByUserId(),
});

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

function PreferencesPage() {
  const { preferences: initialPreferences } = Route.useLoaderData();
  const [preferences, setPreferences] =
    useState<SelectPreference>(initialPreferences);
  const { mutate: updatePreferences } = useMutatePreferences();

  const handleSavePreferences = async () => {
    updatePreferences(preferences);
  };

  return (
    <>
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Recipe Preferences
          </h2>
          <p className="text-muted-foreground">
            Customize your cooking experience by setting your preferences.
          </p>
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Your Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="dietaryType">Primary Diet</Label>
              <Select
                value={preferences.dietaryType ?? undefined}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    dietaryType: value,
                  }))
                }
              >
                <SelectTrigger id="dietaryType">
                  <SelectValue placeholder="Select your usual diet" />
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
              <Label htmlFor="allergies">Allergies/Restrictions</Label>
              <Input
                id="allergies"
                value={preferences.allergies ?? ''}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    allergies: e.target.value,
                  }))
                }
                placeholder="Enter ingredients you always want to avoid"
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <div className="space-y-2">
              <Label htmlFor="cookingTime">Typical Cooking Time</Label>
              <Select
                value={preferences.cookingTime ?? undefined}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    cookingTime: value,
                  }))
                }
              >
                <SelectTrigger id="cookingTime">
                  <SelectValue placeholder="Usual available time" />
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

            <div className="space-y-2">
              <Label htmlFor="skillLevel">Cooking Experience</Label>
              <Select
                value={preferences.skillLevel ?? undefined}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    skillLevel: value,
                  }))
                }
              >
                <SelectTrigger id="skillLevel">
                  <SelectValue placeholder="Your skill level" />
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

            <div className="space-y-2">
              <Label htmlFor="servings">Usual Servings</Label>
              <Select
                value={preferences.servings ?? undefined}
                onValueChange={(value) =>
                  setPreferences((prev) => ({ ...prev, servings: value }))
                }
              >
                <SelectTrigger id="servings">
                  <SelectValue placeholder="How many you cook for" />
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
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <div className="space-y-2">
              <Label htmlFor="cuisineType">Favorite Cuisine</Label>
              <Select
                value={preferences.cuisineType ?? undefined}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    cuisineType: value,
                  }))
                }
              >
                <SelectTrigger id="cuisineType">
                  <SelectValue placeholder="Preferred cuisine" />
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

            <div className="space-y-2">
              <Label htmlFor="spiceLevel">Spice Preference</Label>
              <Select
                value={preferences.spiceLevel ?? undefined}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    spiceLevel: value,
                  }))
                }
              >
                <SelectTrigger id="spiceLevel">
                  <SelectValue placeholder="Preferred spice level" />
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

            <div className="space-y-2">
              <Label htmlFor="budget">Typical Budget</Label>
              <Select
                value={preferences.budget ?? undefined}
                onValueChange={(value) =>
                  setPreferences((prev) => ({ ...prev, budget: value }))
                }
              >
                <SelectTrigger id="budget">
                  <SelectValue placeholder="Your usual budget" />
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
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="specialNotes">General Notes</Label>
            <Textarea
              id="specialNotes"
              value={preferences.specialNotes ?? ''}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  specialNotes: e.target.value,
                }))
              }
              placeholder="Any additional notes or preferences"
              className="min-h-[100px]"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-end pt-4">
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </motion.div>
        </CardContent>
      </Card>
    </>
  );
}
