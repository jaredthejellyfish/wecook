import * as React from 'react';

import { getAuth } from '@clerk/tanstack-start/server';
import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { ChefHat, Clock, Users } from 'lucide-react';
import { getWebRequest } from 'vinxi/http';

import { db } from '@/db/db';
import { recipesTable } from '@/db/schema';
import { transformDbRecord } from '@/schemas/recipe';

const recipeById = createServerFn({ method: 'GET' })
  .validator((id: string) => {
    if (!id || id.trim() === '') {
      throw new Error('Valid recipe ID is required');
    }
    return id;
  })
  .handler(async (ctx) => {
    const { userId } = await getAuth(getWebRequest());

    if (!userId) {
      throw redirect({
        to: '/',
      });
    }

    const id = ctx.data;

    try {
      const data = await db
        .select()
        .from(recipesTable)
        .where(eq(recipesTable.id, Number(id)))
        .limit(1);

      if (!data.length) {
        throw notFound();
      }

      const recipe = data[0];
      const transformedRecipe = transformDbRecord(recipe);

      return { recipe: transformedRecipe };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch recipe: ${error.message}`);
      }
      throw error;
    }
  });

export const Route = createFileRoute('/(app)/recipes/$id/print/')({
  component: PrintableRecipePage,
  loader: async ({ params }) => {
    try {
      return await recipeById({ data: params.id });
    } catch (error) {
      console.error('Failed to load recipe:', error);
      throw error;
    }
  },
});

function PrintableRecipePage() {
  const { recipe: recipeData } = Route.useLoaderData();
  const navigate = useNavigate();

  const sluggifiedTitle = recipeData.title.toLowerCase().replace(/ /g, '-');

  React.useEffect(() => {
    // Set document title to recipe name
    document.title = sluggifiedTitle;

    // Function to handle after print
    const handleAfterPrint = () => {
      document.title = 'WeCook';
      window.removeEventListener('afterprint', handleAfterPrint);
      navigate({ to: `/recipes/${recipeData.id}` });
    };

    // Add event listener for print completion
    window.addEventListener('afterprint', handleAfterPrint);

    // Trigger print dialog
    window.print();

    // Cleanup
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [navigate, recipeData.id]);

  return (
    <div className="print-recipe">
      <style>
        {`
          @media print {
            @page {
              margin: 1.5cm;
              size: portrait;
            }

            .print-recipe {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: black;
              line-height: 1.5;
              font-size: 12pt;
            }

            .recipe-header {
              text-align: center;
              margin-bottom: 2cm;
              page-break-inside: avoid;
              page-break-after: always;
            }

            .recipe-title {
              font-size: 24pt;
              font-weight: bold;
              margin-bottom: 0.5cm;
            }

            .recipe-meta {
              display: flex;
              justify-content: center;
              gap: 2cm;
              margin: 1cm 0;
            }

            .recipe-meta-item {
              display: flex;
              align-items: center;
              gap: 0.25cm;
                
            }

            .recipe-image {
              max-width: 100%;
              height: auto;
              margin: 1cm 0;
              page-break-inside: avoid;
              border-radius: 20px;
            }

            .recipe-section {
              margin: 1cm 0;
              page-break-inside: avoid;
            }

            .recipe-section h2 {
              font-size: 16pt;
              font-weight: bold;
              margin-bottom: 0.5cm;
              border-bottom: 1pt solid #000;
              padding-bottom: 0.25cm;
            }

            .ingredients-list {
              columns: 2;
              column-gap: 2cm;
              margin-bottom: 1cm;
            }

            .ingredient-item {
              margin-bottom: 0.25cm;
              break-inside: avoid;
            }

            .instruction-item {
              margin-bottom: 0.5cm;
              display: flex;
              gap: 0.5cm;
              break-inside: avoid;
            }

            .instruction-number {
              font-weight: bold;
              min-width: 1.5cm;
            }

            .notes-list {
              margin-top: 0.5cm;
            }

            .note-item {
              margin-bottom: 0.25cm;
              padding-left: 0.5cm;
              position: relative;
            }

            .note-item::before {
              content: "•";
              position: absolute;
              left: 0;
            }

            .recipe-tags {
              display: none;
            }

            .recipe-tag {
              background: #f0f0f0;
              padding: 0.1cm 0.3cm;
              border-radius: 0.2cm;
              font-size: 10pt;
            }

            .page-break {
              page-break-before: always;
            }
          }
        `}
      </style>

      <div className="recipe-header">
        <h1 className="recipe-title">{recipeData.title}</h1>
        <p className="recipe-description">{recipeData.description}</p>

        <div className="recipe-meta">
          <div className="recipe-meta-item">
            <Clock className="h-4 w-4" />
            <span>{recipeData.totalTime} min</span>
          </div>
          <div className="recipe-meta-item">
            <Users className="h-4 w-4" />
            <span>{recipeData.servings} servings</span>
          </div>
          <div className="recipe-meta-item">
            <ChefHat className="h-4 w-4" />
            <span>{recipeData.difficulty}</span>
          </div>
        </div>

        <div className="recipe-tags">
          {recipeData.tags?.map((tag) => (
            <span key={tag} className="recipe-tag">
              {tag}
            </span>
          ))}
        </div>

        <img
          src={recipeData.image}
          alt={recipeData.title}
          className="recipe-image"
        />
      </div>

      <div className="recipe-section">
        <h2>Ingredients</h2>
        <div className="ingredients-list">
          {recipeData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-item">
              <strong>
                {ingredient.amount} {ingredient.unit}
              </strong>{' '}
              {ingredient.name}
              {ingredient.notes && (
                <div className="text-sm text-gray-600">{ingredient.notes}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="page-break" />

      <div className="recipe-section">
        <h2>Instructions</h2>
        <div className="instructions-list">
          {recipeData.instructions.map((step) => (
            <div key={step.stepNumber} className="instruction-item">
              <span className="instruction-number">{step.stepNumber}.</span>
              <div>
                <div>{step.instruction}</div>
                {step.timingInMinutes && (
                  <div className="text-sm text-gray-600">
                    Time: {step.timingInMinutes} minutes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {recipeData.notes && recipeData.notes.length > 0 && (
        <div className="recipe-section">
          <h2>Notes</h2>
          <div className="notes-list">
            {recipeData.notes.map((note, index) => (
              <div key={index} className="note-item">
                <div>{note.note}</div>
                {note.category && (
                  <div className="text-sm text-gray-600">
                    Category: {note.category}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
