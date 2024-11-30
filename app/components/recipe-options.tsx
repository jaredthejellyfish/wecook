import React, { useCallback, useMemo } from 'react';

import { useRouter } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Printer, Share2, Trash } from 'lucide-react';
import { Bookmark } from 'lucide-react';

import { useBookmarkRecipe } from '@/hooks/useBookmarkRecipe';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDeleteRecipe } from '@/hooks/useDeleteRecipe';
import { cn } from '@/lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Button } from './ui/button';

type Props = {
  id: number;
};

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

const RecipeOptionsContent = ({ id }: Props) => {
  const bookmarkMutation = useBookmarkRecipe();
  const deleteMutation = useDeleteRecipe();
  const { data: bookmarks } = useBookmarks();
  const router = useRouter();

  const handleBookmark = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      await bookmarkMutation.mutateAsync({
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

  const isBookmarked = useMemo(
    () => bookmarks?.some((b) => b.recipeId === id) || false,
    [bookmarks, id],
  );
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-2 md:absolute md:top-4 md:right-4 md:z-50"
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
      <Button variant="outline" size="sm">
        <Printer className="md:mr-2 h-4 w-4" />
        <span className="sr-only md:not-sr-only">Print</span>
      </Button>
      <Button variant="outline" size="sm">
        <Share2 className="md:mr-2 h-4 w-4" />
        <span className="sr-only md:not-sr-only">Share</span>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={deleteMutation.isPending}
          >
            <Trash
              className={cn(
                'md:mr-2 h-4 w-4',
                deleteMutation.isPending && 'animate-pulse',
              )}
            />
            <span className="sr-only md:not-sr-only">Delete</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              recipe and remove it from your bookmarks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default RecipeOptionsContent;
