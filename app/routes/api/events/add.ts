import { db } from '@/db/db';
import { eventsTable } from '@/db/schema';
import { getAuth } from '@clerk/tanstack-start/server';
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { z } from 'zod';

const AddEventSchema = z.object({
    date: z.string(),
    mealType: z.enum(['breakfast', 'brunch', 'lunch', 'snack', 'dinner']),
    recipeId: z.number().int().positive()
});

export const APIRoute = createAPIFileRoute('/api/events/add')({
    POST: async ({ request }) => {
        try {
            const { userId } = await getAuth(request);
            if (!userId) {
                return json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }

            const body = await request.json();
            const parsedBody = AddEventSchema.safeParse(body);

            if (!parsedBody.success) {
                return json({ success: false, error: 'Invalid request body', reason: parsedBody.error.errors }, { status: 400 });
            }

            const { date, mealType, recipeId } = parsedBody.data;

            const event = await db.insert(eventsTable)
                .values({
                    date,
                    mealType,
                    recipeId,
                    userId
                })
                .returning();

            return json({ success: true, event: event[0] });
        } catch (error) {
            switch (true) {
                case (error as { code?: string })?.code === 'SQLITE_CONSTRAINT':
                    return json({ success: false, error: 'Event already exists', reason: error }, { status: 400 });
                default:
                    return json({ success: false, error: 'Internal Server Error', reason: error }, { status: 500 });
            }
        }
    },
});
