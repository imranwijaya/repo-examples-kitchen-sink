import { EyeIcon } from '@heroicons/react/outline';
import { CodeIcon } from '@heroicons/react/outline';
import { CheckIcon, ClipboardCopyIcon, HomeIcon } from '@heroicons/react/solid';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/vsDark';
import { Fragment, ReactNode, Suspense, useEffect, useState } from 'react';
import type { UrlObject } from 'url';

import { ErrorBoundary } from './ClientSuspense';
import { trpc } from './trpc';
import { useClipboard } from './useClipboard';

interface SourceFile {
  title: string;
  path: string;
  query?: UrlObject['query'];
  pathname?: UrlObject['pathname'];
}

function clsx(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ');
}

export interface ExampleProps {
  title: string;
  href: string;
  pathname?: UrlObject['pathname'];
  query?: UrlObject['query'];
  /**
   * Only render this on the client
   */
  clientOnly?: boolean;
  /**
   * Summary - shown on home page
   */
  summary?: JSX.Element;
  /**
   * Detail page components
   */
  detail?: JSX.Element;
  /**
   * Files for "View Source" in the UI
   */
  files: SourceFile[];
}

export default function Breadcrumbs(props: {
  pages: { title: string; href: string }[];
}) {
  const router = useRouter();

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link href="/">
              <a className="text-gray-400 hover:text-gray-500">
                <HomeIcon
                  className="flex-shrink-0 h-5 w-5"
                  aria-hidden="true"
                />
                <span className="sr-only">Home</span>
              </a>
            </Link>
          </div>
        </li>
        {props.pages.map((page) => (
          <li key={page.href}>
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 h-5 w-5 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <Link href={page.href}>
                <a
                  href={page.href}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  aria-current={
                    router.pathname === page.href ? 'page' : undefined
                  }
                >
                  {page.title}
                </a>
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Code(props: { contents: string; language: string }) {
  return (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={props.contents}
      language="tsx"
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} p-4 overflow-scroll rounded`}
          style={style}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

function basename(path: string) {
  return path.split('/').pop() ?? '';
}

function ViewSource(props: SourceFile) {
  const query = trpc.source.getSource.useQuery(
    { path: props.path },
    {
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  const filename = basename(props.path);
  const language = filename.split('.').pop() ?? '';

  const [hasCopied, copy] = useClipboard(query.data?.contents || '');

  if (!query.data) {
    return <Spinner />;
  }

  return (
    <div className="relative">
      <button
        onClick={copy}
        type="button"
        className="absolute right-4 top-4 inline-flex items-center p-1.5 border border-transparent rounded-lg shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        {hasCopied ? (
          <>
            <span className="sr-only">Copied</span>
            <CheckIcon className="h-5 w-5" aria-hidden />
          </>
        ) : (
          <>
            <span className="sr-only">Copy</span>
            <ClipboardCopyIcon className="h-5 w-5" aria-hidden />
          </>
        )}
      </button>
      <Code contents={query.data.contents} language={language} />
    </div>
  );
}

function Spinner() {
  return (
    <div>
      <span className="animate animate-spin italic py-2 text-primary-500 inline-block">
        ⏳
      </span>
    </div>
  );
}

function ClientOnly(props: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return <Spinner />;
  }
  return <>{props.children}</>;
}
export function ExamplePage(
  props: ExampleProps & {
    children?: ReactNode;
  },
) {
  const routerQuery = useRouter().query;
  const utils = trpc.useContext();

  useEffect(() => {
    for (const file of props.files) {
      utils.source.getSource.prefetch({ path: file.path });
    }
  }, [props.files, utils]);

  const innerContent = (
    <Suspense fallback={<Spinner />}>
      {!routerQuery.file && props.children}

      {props.files.map((file) => (
        <Fragment key={file.path}>
          {file.path === routerQuery.file && <ViewSource {...file} />}
        </Fragment>
      ))}
    </Suspense>
  );
  const content = props.clientOnly ? (
    <ClientOnly>{innerContent}</ClientOnly>
  ) : (
    innerContent
  );

  const query =
    props.query && typeof props.query !== 'string' ? props.query : undefined;

  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <div className="bg-primary-400">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            {props.title}
          </h1>

          <div className="text-primary-200">{props.summary}</div>
        </div>
      </div>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4 p-4">
          <Breadcrumbs pages={[props]} />
          <hr className="w-full border-t border-gray-300" />
          <div className="border-l-2 bg-white border-primary-400 overflow-hidden py-2 px-4 space-y-2">
            <div className="p-2">
              <h3 className="text-2xl font-bold mb-2">{props.title}</h3>
              <div className="prose">{props.detail || props.summary}</div>
            </div>
          </div>
          <div id="content">
            <div className="flex justify-between sticky top-0 bg-primary-100 bg-opacity-50 overflow-x-auto">
              <div></div>
              <div className="btn-group top-0">
                <Link
                  href={{
                    pathname: props.pathname,
                    query: { ...query, file: undefined },
                    hash: 'content',
                  }}
                  scroll={false}
                >
                  <a
                    className={clsx('btn', !routerQuery.file && 'btn--active')}
                  >
                    <EyeIcon className="btn__icon" aria-hidden="true" />
                    Preview
                  </a>
                </Link>
                {props.files.map((file) => {
                  const q =
                    file.query && typeof file.query !== 'string'
                      ? file.query
                      : undefined;

                  return (
                    <Link
                      href={{
                        pathname: file.pathname,
                        query: { ...q, file: file.path },
                        hash: 'content',
                      }}
                      scroll={false}
                      key={file.path}
                    >
                      <a
                        className={clsx(
                          'btn',
                          routerQuery.file === file.path && 'btn--active',
                        )}
                      >
                        <CodeIcon className="btn__icon" aria-hidden="true" />
                        <code>{basename(file.path)}</code>
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg bg-white p-4">
              <ErrorBoundary>{content}</ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
