import { ExampleProps } from 'utils/ExamplePage';

export const meta: ExampleProps = {
  title: 'Server Side Rendering (SSR)',
  summary: (
    <p>
      Using Server Side Rendering &amp; <code>getServerSideProps</code>
    </p>
  ),
  href: '/ssr',
  files: [
    { title: 'Page', path: 'pages/ssr/index.tsx' },
    { title: 'Router', path: 'feature/ssr/router.ts' },
  ],
};

export const metaId: (id: string, data: unknown) => ExampleProps = (
  id,
  data,
) => ({
  title: 'Server Side Rendering (SSR)',
  summary: (
    <p>
      Using Server Side Rendering &amp; <code>getServerSideProps</code>
    </p>
  ),
  detail: <p>{data ? `/ssr/${id}` : 'Data not found'}</p>,
  href: '/ssr',
  pathname: '/ssr/[id]',
  query: { id },
  files: [
    {
      title: 'Detail',
      path: 'pages/ssr/[id].tsx',
      pathname: '/ssr/[id]',
      query: { id },
    },
    {
      title: 'Detail',
      path: 'feature/ssr/router.ts',
      pathname: '/ssr/[id]',
      query: { id },
    },
  ],
});
