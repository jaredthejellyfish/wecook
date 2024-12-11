import { db } from '@/db/db';
import { eventsTable } from '@/db/schema';
import { getAuth } from '@clerk/tanstack-start/server';
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';

const RemoveEventSchema = z.object({
    id: z.number().int().positive()
});

export const APIRoute = createAPIFileRoute('/api/events/remove')({
    DELETE: async ({ request }) => {
        try {
            const { userId } = await getAuth(request);
            if (!userId) {
                return json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }

            const url = new URL(request.url);
            const id = Number(url.searchParams.get('id'));
            
            if (!RemoveEventSchema.safeParse({ id }).success) {
                return json({ success: false, error: 'Invalid event ID' }, { status: 400 });
            }
            
            const deleted = await db.delete(eventsTable)
                .where(and(
                    eq(eventsTable.id, id),
                    eq(eventsTable.userId, userId)
                ))
                .returning();

            if (!deleted.length) {
                return json({ success: false, error: 'Event not found' }, { status: 404 });
            }

            return json({ success: true, event: deleted[0] });
        } catch {
            return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
        }
    },
});
