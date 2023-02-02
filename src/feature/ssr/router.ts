import { t } from 'server/trpc/trpc';
import { z } from 'zod';

const posts = [
  {
    id: '1',
    title: 'This data comes from the backend (a)',
  },
  {
    id: '2',
    title: 'This data comes from the backend (b)',
  },
];

const ssrRouter = t.router({
  getAll: t.procedure.query(() => posts),
  getOneById: t.procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const post = posts.find((post) => post.id === input.id);
      return post ?? null;
    }),
});

export default ssrRouter;
