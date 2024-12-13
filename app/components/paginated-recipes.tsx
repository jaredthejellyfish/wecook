import React, { useState } from 'react';

import { ChevronRight } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useBookmarks } from '@/hooks/useBookmarks';
import type { Recipe } from '@/schemas/recipe';

import RecipeCard from './recipe-card';
import { Button } from './ui/button';

type Props = {
  activeTab: string;
  searchTerm: string;
  filteredRecipes: Recipe[];
};

function PaginatedRecipes({ activeTab, searchTerm, filteredRecipes }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Reset to first page when items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, itemsPerPage]);

  const { data: bookmarks, refetch: refetchBookmarks } = useBookmarks();

  return (
    <div>
      <div className="flex flex-col gap-y-4 sm:grid sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {currentRecipes.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground dark:text-neutral-400">
            No recipes found
          </div>
        )}

        {currentRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            refetchBookmarks={refetchBookmarks}
            bookmarks={bookmarks ?? []}
          />
        ))}
      </div>
      {/* Pagination Controls */}
      {filteredRecipes.length > 6 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
                <SelectItem value="96">96</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaginatedRecipes;
