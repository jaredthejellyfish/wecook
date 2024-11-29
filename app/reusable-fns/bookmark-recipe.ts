import { db } from "@/db/db";
import { bookmarksTable } from "@/db/schema";
import { getAuth } from "@clerk/tanstack-start/server";
import { eq, and } from "drizzle-orm";
import { createServerFn } from "@tanstack/start";
import { getWebRequest } from "vinxi/http";

const bookmarkRecipeFn = createServerFn({ method: "GET" })
    .validator(({ recipe_id }: { recipe_id: string }) => {
        const parsedId = parseInt(recipe_id);
        if (isNaN(parsedId) || parsedId <= 0) {
            throw new Error("Invalid recipe ID format");
        }
        return { recipe_id: parsedId };
    })
    .handler(async (ctx) => {
        try {
            const { userId } = await getAuth(getWebRequest());

            if (!userId) {
                throw new Error("Authentication required");
            }

            const { recipe_id } = ctx.data;

            // Use a transaction to ensure data consistency
            return await db.transaction(async (tx) => {
                const existingBookmark = await tx
                    .select()
                    .from(bookmarksTable)
                    .where(
                        and(
                            eq(bookmarksTable.recipeId, recipe_id),
                            eq(bookmarksTable.userId, userId)
                        )
                    )
                    .limit(1);

                // Toggle bookmark status
                if (existingBookmark.length > 0) {
                    await tx
                        .delete(bookmarksTable)
                        .where(
                            and(
                                eq(bookmarksTable.recipeId, recipe_id),
                                eq(bookmarksTable.userId, userId)
                            )
                        );
                    return {
                        message: "Recipe bookmark removed",
                        status: "removed"
                    };
                }

                await tx.insert(bookmarksTable).values({
                    recipeId: recipe_id,
                    userId
                });

                return {
                    message: "Recipe bookmarked successfully",
                    status: "added"
                };
            });
        } catch (error) {
            // Handle specific error cases
            if (error instanceof Error) {
                throw new Error(`Bookmark operation failed: ${error.message}`);
            }
            throw new Error("Unexpected error during bookmark operation");
        }
    });

export default bookmarkRecipeFn; 
