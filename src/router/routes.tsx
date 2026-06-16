import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthGuard, RoleGuard, PublicOnlyGuard } from './guards';
import AppLayout from '../components/shared/AppLayout';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const FeedPage = lazy(() => import('../pages/FeedPage'));
const EmailVerificationPage = lazy(() => import('../pages/EmailVerificationPage'));
const CreatorOnboardingPage = lazy(() => import('../pages/CreatorOnboardingPage'));
const BrandOnboardingPage = lazy(() => import('../pages/BrandOnboardingPage'));
const CreatorProfilePage = lazy(() => import('../pages/CreatorProfilePage'));
const PortfolioEditorPage = lazy(() => import('../pages/PortfolioEditorPage'));
const AITemplateGeneratorPage = lazy(() => import('../pages/AITemplateGeneratorPage'));
const BrandProfilePage = lazy(() => import('../pages/BrandProfilePage'));
const CampaignEditorPage = lazy(() => import('../pages/CampaignEditorPage'));
const SwipeReviewPage = lazy(() => import('../pages/SwipeReviewPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const VerificationFlowPage = lazy(() => import('../pages/VerificationFlowPage'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f7ff]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-brand-gradient flex items-center justify-center text-white font-black text-lg shadow-glow animate-pulse">
          CL
        </div>
        <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyGuard>
        <Suspense fallback={<LoadingFallback />}>
          <LoginPage />
        </Suspense>
      </PublicOnlyGuard>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyGuard>
        <Suspense fallback={<LoadingFallback />}>
          <RegisterPage />
        </Suspense>
      </PublicOnlyGuard>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <EmailVerificationPage />
      </Suspense>
    ),
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          {
            path: '/feed',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <FeedPage />
              </Suspense>
            ),
          },
          {
            path: '/notifications',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotificationsPage />
              </Suspense>
            ),
          },
          {
            path: '/creator/:id',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <CreatorProfilePage />
              </Suspense>
            ),
          },
          {
            path: '/brand/:id',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <BrandProfilePage />
              </Suspense>
            ),
          },
          // Creator Only Routes
          {
            element: <RoleGuard role="creator" />,
            children: [
              {
                path: '/onboarding/creator',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <CreatorOnboardingPage />
                  </Suspense>
                ),
              },
              {
                path: '/creator/me/portfolio',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <PortfolioEditorPage />
                  </Suspense>
                ),
              },
              {
                path: '/creator/me/ai-templates',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <AITemplateGeneratorPage />
                  </Suspense>
                ),
              },
              {
                path: '/creator/me/verification',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <VerificationFlowPage />
                  </Suspense>
                ),
              },
            ],
          },
          // Brand Only Routes
          {
            element: <RoleGuard role="brand" />,
            children: [
              {
                path: '/onboarding/brand',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <BrandOnboardingPage />
                  </Suspense>
                ),
              },
              {
                path: '/brand/me/campaigns/new',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <CampaignEditorPage />
                  </Suspense>
                ),
              },
              {
                path: '/brand/me/campaigns/:id/edit',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <CampaignEditorPage />
                  </Suspense>
                ),
              },
              {
                path: '/brand/me/campaigns/:id/review',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <SwipeReviewPage />
                  </Suspense>
                ),
              },
              {
                path: '/brand/me/verification',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <VerificationFlowPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
