import { useEffect } from 'react';
import { useState } from 'react';

import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Bookmark } from 'lucide-react';

import type { SelectBookmark } from '@/db/schema';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/schemas/recipe';
import bookmarkRecipeFn from '@/server-fns/bookmark-recipe';

import { Button } from './ui/button';

type Props = {
  recipe: Recipe;
  refetchBookmarks: () => void;
  bookmarks: SelectBookmark[];
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

function RecipeCard({ recipe, refetchBookmarks, bookmarks }: Props) {
  const [isBookmarked, setIsBookmarked] = useState(
    bookmarks?.some((b) => b.recipeId === recipe.id) ?? false,
  );

  useEffect(() => {
    setIsBookmarked(bookmarks?.some((b) => b.recipeId === recipe.id) ?? false);
  }, [bookmarks, recipe.id]);

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="block w-full" // Add this to ensure the link takes full width
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        transition={{ delay: 0.5 }}
        className="group relative overflow-hidden rounded-lg border bg-white dark:bg-neutral-800 shadow-md transition-all hover:shadow-lg w-full" // Add w-full here
      >
        <div className="aspect-video overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="object-cover w-full h-full transition-transform border-transparent group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.wecook.dev/image-1732851289200-a5f41037.png';
            }}
          />
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center text-sm text-muted-foreground dark:text-neutral-400">
              <Clock className="mr-1 h-4 w-4" />
              {recipe.totalTime} mins
            </div>
            <div className="text-sm text-muted-foreground dark:text-neutral-400">
              {recipe.category}
            </div>
          </div>
          <h3 className="mt-2 font-semibold leading-none tracking-tight dark:text-white truncate">
            {recipe.title}
          </h3>
        </div>
        <Button
          className="absolute right-4 top-4 h-8 w-8 rounded-full"
          size="icon"
          variant="secondary"
          onClick={async (e) => {
            e.preventDefault();
            // Optimistically update UI
            setIsBookmarked((prev) => !prev);
            try {
              await bookmarkRecipeFn({
                data: { recipe_id: recipe.id },
              });
              refetchBookmarks();
            } catch (error) {
              // Revert optimistic update on error
              setIsBookmarked((prev) => !prev);
              console.error('Failed to bookmark recipe:', error);
            }
          }}
        >
          <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-primary')} />
          <span className="sr-only">Bookmark recipe</span>
        </Button>
      </motion.div>
    </Link>
  );
}

export default RecipeCard;
