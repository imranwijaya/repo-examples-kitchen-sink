import { ExampleProps } from 'utils/ExamplePage';

export const meta: ExampleProps = {
  title: 'Infinite Query',
  href: '/infinite-query',
  summary: (
    <p>
      Using Server Side Rendering &amp; <code>getServerSideProps</code>
    </p>
  ),
  files: [
    { title: 'Page', path: 'pages/infinite-query/index.tsx' },
    { title: 'Router', path: 'feature/infinite-query/router.ts' },
  ],
};
