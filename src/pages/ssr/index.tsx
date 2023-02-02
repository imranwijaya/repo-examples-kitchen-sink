import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { meta } from 'feature/ssr/meta';
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import NextLink from 'next/link';
import type { SVGProps } from 'react';
import { createContext } from 'server/trpc/context';
import { appRouter } from 'server/trpc/routers';
import superjson from 'superjson';
import { ExamplePage } from 'utils/ExamplePage';
import { trpc } from 'utils/trpc';

export const getServerSideProps: GetServerSideProps = async () => {
  const ssgHelper = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  await ssgHelper.ssrRouter.getAll.prefetch();

  return { props: { trpcState: ssgHelper.dehydrate() } };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const Page: NextPage<Props> = () => {
  const { data } = trpc.ssrRouter.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <ExamplePage {...meta}>
      <div className="flex flex-col gap-2">
        {data && data.length > 0 ? (
          data.map((e) => (
            <article key={e.id} className="rounded bg-slate-400 py-4 px-2">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Post #{e.id}</h2>
                <NextLink href={`/ssr/${e.id}`}>
                  <a className="flex cursor-pointer items-center gap-2 underline">
                    view detail
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </NextLink>
              </div>
              <p>{e.title}</p>
            </article>
          ))
        ) : (
          <article>Empty Data</article>
        )}
      </div>
    </ExamplePage>
  );
};

export default Page;

const ArrowTopRightOnSquareIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81L8.03 17.03a.75.75 0 01-1.06-1.06L19.19 3.75h-3.44a.75.75 0 010-1.5zm-10.5 4.5a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V10.5a.75.75 0 011.5 0v8.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V8.25a3 3 0 013-3h8.25a.75.75 0 010 1.5H5.25z"
      clipRule="evenodd"
    />
  </svg>
);
