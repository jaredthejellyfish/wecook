import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { db } from '@/db/db';
import { eventsTable } from '@/db/schema';
import { getAuth } from '@clerk/tanstack-start/server';
import { eq, and, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

const EventListSchema = z.object({
    from: z.string().transform((date) => {
        return date;
    }).optional(),
    to: z.string().transform((date) => {
        return date;
    }).optional(),
}).transform((data) => {
    let { from, to } = data;

    if (!from && !to) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        from = yesterday.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
        to = undefined;
    } else {
        if (!from && to) {
            const toDate = new Date(to);
            toDate.setMonth(toDate.getMonth() - 1);
            from = toDate.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            });
        }
        if (!to && from) {
            const fromDate = new Date(from);
            fromDate.setMonth(fromDate.getMonth() + 1, 0);
            to = fromDate.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            });
        }
    }

    return { from, to };
});

export const APIRoute = createAPIFileRoute('/api/events/list')({
    GET: async ({ request }) => {
        try {
            const url = new URL(request.url);
            const params = Object.fromEntries(url.searchParams);

            const parsedParams = EventListSchema.safeParse(params);

            if (!parsedParams.success) {
                return json({ success: false, error: 'Invalid parameters', reason: parsedParams.error.errors }, { status: 400 });
            }

            const { userId } = await getAuth(request);
            if (!userId) {
                return json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }

            const { from, to } = parsedParams.data;

            const events = await db.select()
                .from(eventsTable)
                .where(and(
                    eq(eventsTable.userId, userId),
                    ...(from ? [gte(eventsTable.date, from)] : []),
                    ...(to ? [lte(eventsTable.date, to)] : [])
                ))

            return json({ success: true, events, from, to });
        } catch {
            return json({ success: false, error: `Internal Server Error` }, { status: 500 });
        }
    },
})