import React, { Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';

const LandingPage = React.lazy(() => import('../features/LandingPage'));
const MergePage = React.lazy(() => import('../features/merge/MergePage'));
const SplitPage = React.lazy(() => import('../features/split/SplitPage'));
const CompressPage = React.lazy(() => import('../features/compress/CompressPage'));
const RotatePage = React.lazy(() => import('../features/rotate/RotatePage'));
const SignPage = React.lazy(() => import('../features/sign/SignPage'));

const TITLES: Record<string, string> = {
  '/': 'LocalPDF - Private PDF Tools',
  '/merge': 'Merge PDFs - LocalPDF',
  '/split': 'Split PDF - LocalPDF',
  '/compress': 'Compress PDF - LocalPDF',
  '/rotate': 'Rotate PDF - LocalPDF',
  '/sign': 'Sign PDF - LocalPDF',
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = TITLES[pathname] ?? 'LocalPDF';
  }, [pathname]);

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageWrapper><LandingPage /></PageWrapper>,
  },
  {
    path: '/merge',
    element: <PageWrapper><MergePage /></PageWrapper>,
  },
  {
    path: '/split',
    element: <PageWrapper><SplitPage /></PageWrapper>,
  },
  {
    path: '/compress',
    element: <PageWrapper><CompressPage /></PageWrapper>,
  },
  {
    path: '/rotate',
    element: <PageWrapper><RotatePage /></PageWrapper>,
  },
  {
    path: '/sign',
    element: <PageWrapper><SignPage /></PageWrapper>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
