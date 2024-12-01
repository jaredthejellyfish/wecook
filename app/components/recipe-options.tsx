import React, { useCallback, useMemo, lazy, Suspense } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Printer,
  Share2,
} from 'lucide-react';

import { useBookmarkRecipe } from '@/hooks/useBookmarkRecipe';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDeleteRecipe } from '@/hooks/useDeleteRecipe';
import { useEditRecipe } from '@/hooks/useEditRecipe';
import { useRecipePublic } from '@/hooks/useRecipePublic';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Lazy load the dialog components
const EditDialog = lazy(() => import('./recipe-options/EditDialog').then(mod => ({ default: mod.EditDialog })));
const DeleteDialog = lazy(() => import('./recipe-options/DeleteDialog').then(mod => ({ default: mod.DeleteDialog })));

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
};

type Status = 'QUEUED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';

const mapRunStatusToStatus = (runStatus: string): Status => {
  switch (runStatus) {
    case 'COMPLETED':
      return 'COMPLETED';
    case 'FAILED':
    case 'CRASHED':
    case 'INTERRUPTED':
    case 'SYSTEM_FAILURE':
      return 'FAILED';
    case 'EXECUTING':
    case 'REATTEMPTING':
      return 'EXECUTING';
    default:
      return 'QUEUED';
  }
};

const RecipeOptionsContent = ({ id, isPublic }: Props) => {
  const bookmarkMutation = useBookmarkRecipe();
  const deleteMutation = useDeleteRecipe();
  const { data: bookmarks } = useBookmarks();
  const editRecipe = useEditRecipe();
  const recipePublic = useRecipePublic();
  const router = useRouter();

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

  // Invalidate router on successful edit
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

      <Button
        variant="outline"
        size="sm"
        onClick={handlePublicToggle}
      >
        <Share2 className={cn('md:mr-2 h-4 w-4', isPublic && 'fill-primary')} />
        <span className="sr-only md:not-sr-only">
          {isPublic ? 'Public' : 'Private'}
        </span>
      </Button>

      <Suspense fallback={<Button variant="outline" size="sm" disabled>Edit</Button>}>
        <EditDialog 
          onEdit={handleEdit}
          isLoading={editRecipe.isLoading}
          run={editRecipe.run}
        />
      </Suspense>

      <Suspense fallback={<Button variant="outline" size="sm" disabled>Delete</Button>}>
        <DeleteDialog
          onDelete={handleDelete}
          isPending={deleteMutation.isPending}
        />
      </Suspense>
    </motion.div>
  );
};

export default RecipeOptionsContent;