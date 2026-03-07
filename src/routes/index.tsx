import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

const LandingPage = React.lazy(() => import('../features/LandingPage'));
const MergePage = React.lazy(() => import('../features/merge/MergePage'));
const SplitPage = React.lazy(() => import('../features/split/SplitPage'));
const CompressPage = React.lazy(() => import('../features/compress/CompressPage'));
const RotatePage = React.lazy(() => import('../features/rotate/RotatePage'));
const SignPage = React.lazy(() => import('../features/sign/SignPage'));

function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LazyWrapper><LandingPage /></LazyWrapper>,
  },
  {
    path: '/merge',
    element: <LazyWrapper><MergePage /></LazyWrapper>,
  },
  {
    path: '/split',
    element: <LazyWrapper><SplitPage /></LazyWrapper>,
  },
  {
    path: '/compress',
    element: <LazyWrapper><CompressPage /></LazyWrapper>,
  },
  {
    path: '/rotate',
    element: <LazyWrapper><RotatePage /></LazyWrapper>,
  },
  {
    path: '/sign',
    element: <LazyWrapper><SignPage /></LazyWrapper>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
