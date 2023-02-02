import { t } from 'server/trpc/trpc';
import { delay } from 'utils/delay';
import { z } from 'zod';

const infiniteQueryRouter = t.router({
  getBatch: t.procedure
    .input(
      z.object({
        limit: z.number().min(1).max(10),
        cursor: z.number().nullish(),
        skip: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, cursor, skip } = input;

      let count: number | undefined = undefined;
      if (!cursor) {
        count = await ctx.prisma.post.count();
      }

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { id: 'asc' },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > limit) {
        const nextItems = posts.pop();
        nextCursor = nextItems?.id;
      }

      if (cursor) {
        // simulates server latency when fetching the next page
        // console.log('delayed');
        await delay(3000);
      }

      return { posts, count, nextCursor };
    }),
});

export default infiniteQueryRouter;
