import { recipeGenerationTask } from "@/trigger/generate-recipe";
import { getAuth } from "@clerk/tanstack-start/server";
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";

// Query parameter validation schema
const QuerySchema = z.object({
  category: z.string().min(1),
  dietary: z.string().optional(),
});

export const Route = createAPIFileRoute("/api/recipes/generate-recipe")({
  GET: async ({ request }) => {
    console.log("Generating recipe...");

    try {
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams);
      const validatedParams = QuerySchema.parse(params);
      const { userId } = await getAuth(request);

      if (!userId) {
        return json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      // Trigger the recipe generation task
      const handle = await tasks.triggerAndPoll<typeof recipeGenerationTask>(
        "recipe-generation-task",
        {
          category: validatedParams.category,
          dietary: validatedParams.dietary,
          userId,
        },
      );

      if (!handle.output) {
        return json(
          {
            success: false,
            error: "Failed to generate recipe",
          },
          { status: 500 },
        );
      }

      return json({
        success: true,
        data: handle.output,
      });
    } catch (error) {
      console.error("Error generating recipe:", error);

      if (error instanceof z.ZodError) {
        return json(
          {
            success: false,
            error: "Invalid parameters",
            details: error.issues,
          },
          { status: 400 },
        );
      }

      return json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 },
      );
    }
  },
});
