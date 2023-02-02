import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { metaId } from 'feature/ssr/meta';
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import NextLink from 'next/link';
import { createContext } from 'server/trpc/context';
import { appRouter } from 'server/trpc/routers';
import superjson from 'superjson';
import { ExamplePage } from 'utils/ExamplePage';
import { trpc } from 'utils/trpc';

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const Page: NextPage<Props> = ({ id }) => {
  const query = trpc.ssrRouter.getOneById.useQuery(
    { id },
    { refetchOnWindowFocus: false },
  );

  const post = query.data;

  return (
    <ExamplePage {...metaId(id, post)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <NextLink href="/ssr">
            <a className="cursor-pointer text-blue-500 underline">
              Back to SSR page
            </a>
          </NextLink>
        </div>
        {post ? (
          <article className="rounded bg-slate-400 py-4 px-2">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Post #{post.id}</h2>
            </div>
            <p>{post.title}</p>
          </article>
        ) : (
          <article>Data not found</article>
        )}
      </div>
    </ExamplePage>
  );
};

export default Page;

export const getServerSideProps: GetServerSideProps<{ id: string }> = async ({
  query,
}) => {
  const id = typeof query.id === 'string' ? query.id : '';

  if (!id) {
    return { notFound: true };
  }

  const ssgHelper = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  await ssgHelper.ssrRouter.getOneById.prefetch({ id });

  return { props: { trpcState: ssgHelper.dehydrate(), id } };
};
