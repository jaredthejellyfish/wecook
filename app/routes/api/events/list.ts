import { db } from '@/db/db';
import { eventsTable } from '@/db/schema';
import { getAuth } from '@clerk/tanstack-start/server';
import { eq, and, gte, lte } from 'drizzle-orm';
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { z } from 'zod';

const EventListSchema = z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
}).transform((data) => {
    let { from, to } = data;

    const formatLocalDate = (date: Date) => {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ).toISOString().split('T')[0];
    };

    if (!from && !to) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        from = formatLocalDate(yesterday);
        to = undefined;
    } else {
        if (!from && to) {
            const toDate = new Date(to);
            toDate.setMonth(toDate.getMonth() - 1);
            from = formatLocalDate(toDate);
        }
        if (!to && from) {
            const fromDate = new Date(from);
            fromDate.setMonth(fromDate.getMonth() + 1, 0);
            to = formatLocalDate(fromDate);
        }
    }

    return { from, to };
});

export const Route = createAPIFileRoute('/api/events/list')({
    GET: async ({ request }) => {
        try {
            const url = new URL(request.url);
            const params = Object.fromEntries(url.searchParams);
            const parsedParams = EventListSchema.safeParse(params);

            if (!parsedParams.success) {
                return json({ success: false, error: 'Invalid parameters' }, { status: 400 });
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
                ));

            return json({ success: true, events, from, to });
        } catch {
            return json({ success: false, error: `Internal Server Error` }, { status: 500 });
        }
    },
});
