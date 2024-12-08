import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Bookmark, Calendar, Printer, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

import { useAddEvent } from '@/hooks/useAddEvent';
import { useBookmarkRecipe } from '@/hooks/useBookmarkRecipe';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDeleteRecipe } from '@/hooks/useDeleteRecipe';
import { useEditRecipe } from '@/hooks/useEditRecipe';
import { useEvents } from '@/hooks/useEvents';
import { useRecipePublic } from '@/hooks/useRecipePublic';
import { cn } from '@/lib/utils';

import { DatePicker } from './date-picker';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// Lazy load the dialog components
const EditDialog = lazy(() =>
  import('./recipe-options/EditDialog').then((mod) => ({
    default: mod.EditDialog,
  })),
);
const DeleteDialog = lazy(() =>
  import('./recipe-options/DeleteDialog').then((mod) => ({
    default: mod.DeleteDialog,
  })),
);

// Moved animations outside component to prevent recreation
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

type Props = {
  id: number;
  isPublic: boolean;
  isOwned: boolean;
};

type MealType = 'breakfast' | 'brunch' | 'lunch' | 'snack' | 'dinner';

const RecipeOptionsContent = ({ id, isPublic, isOwned }: Props) => {
  const bookmarkMutation = useBookmarkRecipe();
  const deleteMutation = useDeleteRecipe();
  const { data: bookmarks } = useBookmarks();
  const editRecipe = useEditRecipe();
  const recipePublic = useRecipePublic();
  const addEvent = useAddEvent();
  const router = useRouter();
  const { data: events } = useEvents();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mealType, setMealType] = useState<MealType>('breakfast');

  const [existingEvent, setExistingEvent] = useState<boolean>(false);

  useEffect(() => {
    if (!events || !date) return;

    setExistingEvent(
      events.some((event) => event.date === date.toISOString().split('T')[0]),
    );
  }, [events, date]);

  const handleBookmark = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      return bookmarkMutation.mutateAsync({
        data: { recipe_id: id },
      });
    },
    [bookmarkMutation, id],
  );

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      const res = await deleteMutation.mutateAsync(id.toString());
      if (res.success) {
        router.navigate({ to: '/recipes' });
      }
    },
    [deleteMutation, id, router],
  );

  const handleEdit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      editRecipe.submit({
        recipeId: id.toString(),
        note: new FormData(e.target as HTMLFormElement).get('note') as string,
      });
    },
    [editRecipe, id],
  );

  const handlePublicToggle = useCallback(() => {
    recipePublic.submit({ recipeId: id.toString(), isPublic: !isPublic });
  }, [recipePublic, id, isPublic]);

  const isBookmarked = useMemo(
    () => bookmarks?.some((b) => b.recipeId === id) || false,
    [bookmarks, id],
  );

  const handleAddEvent = useCallback(
    (mealType: MealType, date: string | null) => {
      if (!date || !mealType) {
        return;
      }

      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      addEvent.mutateAsync({
        date: formattedDate,
        mealType,
        recipeId: id,
      });
    },
    [addEvent, date, id],
  );

  React.useEffect(() => {
    if (editRecipe.run?.status === 'COMPLETED') {
      router.invalidate();
    }
  }, [editRecipe.run?.status, router]);

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-2 md:absolute md:top-2 md:right-2 lg:top-4 lg:right-4 md:z-30 flex-wrap md:justify-end"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleBookmark}
        disabled={bookmarkMutation.isPending}
      >
        <Bookmark
          className={cn(
            'h-4 w-4',
            isBookmarked && 'fill-primary',
            bookmarkMutation.isPending && 'animate-pulse',
          )}
        />
        <span className="sr-only md:not-sr-only">Bookmark</span>
      </Button>

      <Link to={'/recipes/$id/print'} params={{ id: id.toString() }}>
        <Button variant="outline" size="sm">
          <Printer className="md:mr-2 h-4 w-4" />
          <span className="sr-only md:not-sr-only">Print</span>
        </Button>
      </Link>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Calendar className="md:mr-2 h-4 w-4" />
            <span className="sr-only md:not-sr-only">Schedule</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Schedule Recipe
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a date and meal type to add this recipe to your meal plan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <DatePicker date={date} setDate={setDate} />
            </div>
            <div className="grid gap-2">
              <Label>Meal Type</Label>
              <Select
                onValueChange={(value) => setMealType(value as MealType)}
                value={mealType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="brunch">Brunch</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="submit"
                className="w-full"
                onClick={() =>
                  handleAddEvent(mealType, date?.toISOString() || null)
                }
                disabled={existingEvent}
              >
                {existingEvent ? 'Event exists' : 'Add to Meal Plan'}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isOwned && (
        <Button variant="outline" size="sm" onClick={handlePublicToggle}>
          <Share2
            className={cn('md:mr-2 h-4 w-4', isPublic && 'fill-primary')}
          />
          <span className="sr-only md:not-sr-only">
            {isPublic ? 'Public' : 'Private'}
          </span>
        </Button>
      )}

      {isOwned && (
        <Suspense
          fallback={
            <Button variant="outline" size="sm" disabled>
              Edit
            </Button>
          }
        >
          <EditDialog
            onEdit={handleEdit}
            isLoading={editRecipe.isLoading}
            run={editRecipe.run}
          />
        </Suspense>
      )}

      {isOwned && (
        <Suspense
          fallback={
            <Button variant="outline" size="sm" disabled>
              Delete
            </Button>
          }
        >
          <DeleteDialog
            onDelete={handleDelete}
            isPending={deleteMutation.isPending}
          />
        </Suspense>
      )}
    </motion.div>
  );
};

export default RecipeOptionsContent;
