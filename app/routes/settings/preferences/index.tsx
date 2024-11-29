import { getAuth } from '@clerk/tanstack-start/server';
import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { getWebRequest } from 'vinxi/http';

import Header from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
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
import { SidebarProvider } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';

import authStateFn from '@/reusable-fns/auth-redirect';

import { db } from '@/db/db';
import { preferencesTable } from '@/db/schema';

const preferencesByUserId = createServerFn({ method: 'GET' }).handler(
  async () => {
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
  },
);

export const Route = createFileRoute('/settings/preferences/')({
  component: PreferencesPage,
  loader: () => preferencesByUserId(),
  beforeLoad: () => authStateFn(),
});

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

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState({
    dietaryType: '',
    allergies: '',
    cookingTime: '',
    skillLevel: '',
    servings: '',
    cuisineType: '',
    spiceLevel: '',
    specialNotes: '',
    budget: '',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const handleSavePreferences = async () => {
    try {
      // Here you would make an API call to save preferences
      toast.success('Preferences saved successfully!');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <SidebarProvider>
      <Header />
      <div className="relative flex min-h-screen flex-col top-16 w-full bg-gradient-to-b from-white to-neutral-100 dark:bg-gradient-to-b dark:from-neutral-800/50 dark:to-neutral-900/50 dark:text-white">
        <div className="flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <SidebarNav />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex-1 space-y-6 md:p-8 p-3 pt-6"
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Recipe Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dietary Requirements */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Primary Diet</Label>
                  <Select
                    value={preferences.dietaryType}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({
                        ...prev,
                        dietaryType: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[280px]">
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

                {/* Allergies */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Allergies/Restrictions</Label>
                  <Input
                    className="col-span-3"
                    value={preferences.allergies}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        allergies: e.target.value,
                      }))
                    }
                    placeholder="Enter ingredients you always want to avoid"
                  />
                </div>

                {/* Cooking Parameters */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Typical Cooking Time</Label>
                  <Select
                    value={preferences.cookingTime}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({
                        ...prev,
                        cookingTime: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
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

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Cooking Experience</Label>
                  <Select
                    value={preferences.skillLevel}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, skillLevel: value }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
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

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Usual Servings</Label>
                  <Select
                    value={preferences.servings}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, servings: value }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
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

                {/* Cuisine Preferences */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Favorite Cuisine</Label>
                  <Select
                    value={preferences.cuisineType}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({
                        ...prev,
                        cuisineType: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
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

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Spice Preference</Label>
                  <Select
                    value={preferences.spiceLevel}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, spiceLevel: value }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
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

                {/* Budget */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Typical Budget</Label>
                  <Select
                    value={preferences.budget}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, budget: value }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
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

                {/* Additional Notes */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">General Notes</Label>
                  <Textarea
                    className="col-span-3"
                    value={preferences.specialNotes}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        specialNotes: e.target.value,
                      }))
                    }
                    placeholder="Any general preferences or requirements you want to save?"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SidebarProvider>
  );
}
