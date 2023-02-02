import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { meta } from 'feature/infinite-query/meta';
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { createContext } from 'server/trpc/context';
import { appRouter } from 'server/trpc/routers';
import superjson from 'superjson';
import { ExamplePage } from 'utils/ExamplePage';
import { trpc } from 'utils/trpc';

const limit = 4;

export const getServerSideProps: GetServerSideProps = async () => {
  const ssgHelper = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  await ssgHelper.infiniteQueryRouter.getBatch.prefetchInfinite({
    limit: limit,
  });

  return { props: { trpcState: ssgHelper.dehydrate() } };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const Page: NextPage<Props> = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.infiniteQueryRouter.getBatch.useInfiniteQuery(
      { limit: limit },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
        retry: false,
      },
    );

  const observerRef = useRef<HTMLDivElement>(null);
  const [ref, setRef] = useState(observerRef.current);

  const observerCallback = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];

      if (hasNextPage && target?.isIntersecting && !isFetchingNextPage) {
        await fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const observerElement = ref;
    if (!observerElement) return;

    const observer = new IntersectionObserver(observerCallback);
    observer.observe(observerElement);

    return () => observer.unobserve(observerElement);
  }, [ref, observerCallback]);

  return (
    <ExamplePage {...meta}>
      <div className="flex flex-col gap-2">
        {data
          ? data.pages.map((page, index) => {
              const count = page.count;
              return (
                <Fragment key={index}>
                  {count ? <div>Total: {count}</div> : null}
                  {page.posts.map((post) => {
                    return (
                      <article
                        key={post.id}
                        className="rounded bg-slate-400 py-14 px-2"
                      >
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold">Post #{post.id}</h2>
                        </div>
                        <p>{post.title}</p>
                      </article>
                    );
                  })}
                </Fragment>
              );
            })
          : null}
        {isFetchingNextPage && hasNextPage ? (
          <div className="flex animate-pulse flex-col items-center justify-center gap-2 rounded bg-slate-400 py-14 px-2 text-2xl">
            <div className="text-center text-sm">
              delay for 3 seconds to simulate server latency when fetching next
              page.
            </div>
            <div>Fetching next page...</div>
          </div>
        ) : null}
        {!hasNextPage ? (
          <div className="flex items-center justify-center py-12 px-2">
            <div>End of data</div>
          </div>
        ) : null}
        <div ref={setRef} id="loader" />
      </div>
    </ExamplePage>
  );
};

export default Page;
