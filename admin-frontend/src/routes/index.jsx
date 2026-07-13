import React, { Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from '../components/security/RoleRoute';
import { Forbidden } from '../pages/Forbidden';
import { ErrorPage } from '../pages/ErrorPage';

// Lazy loaded feature modules
const Login = React.lazy(() => import('../features/auth/components/Login').then(module => ({ default: module.Login })));
const OAuth2RedirectHandler = React.lazy(() => import('../features/auth/components/OAuth2RedirectHandler').then(module => ({ default: module.OAuth2RedirectHandler })));
const Dashboard = React.lazy(() => import('../features/dashboard/components/Dashboard').then(module => ({ default: module.Dashboard })));
const UserList = React.lazy(() => import('../features/users/components/UserList').then(module => ({ default: module.UserList })));
const AuditList = React.lazy(() => import('../features/audit/components/AuditList').then(module => ({ default: module.AuditList })));
const SettingsLayout = React.lazy(() => import('../features/settings/components/SettingsLayout').then(module => ({ default: module.SettingsLayout })));
const AdminAnalytics = React.lazy(() => import('../features/analytics/components/AdminAnalytics').then(module => ({ default: module.AdminAnalytics })));
const SuspensionsPage = React.lazy(() => import('../features/suspensions/components/SuspensionsPage'));
const ActivityMonitor = React.lazy(() => import('../features/activities/components/ActivityMonitor'));

/**
 * If a password-reset email link accidentally points to the admin port,
 * this component safely bounces the visitor to the correct user-facing app
 * while preserving the token query param. It only runs when this specific
 * route is matched — NOT on every page load.
 */
const ResetPasswordRedirect = () => {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    window.location.replace(
      `http://localhost:5174/reset-password${token ? `?token=${encodeURIComponent(token)}` : ''}`
    );
  }, [location.search]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <p className="text-sm font-medium text-gray-500">Redirecting to password reset…</p>
      </div>
    </div>
  );
};

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-sm font-medium text-gray-500">Loading module...</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: '/oauth2/redirect',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OAuth2RedirectHandler />
          </Suspense>
        ),
      },
      {
        path: '/reset-password',
        element: <ResetPasswordRedirect />,
      },
      {
        path: '/403',
        element: <Forbidden />,
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/',
            element: (
              <RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT_TEAM', 'AUDITOR']}>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </RoleRoute>
            ),
          },
          {
            path: '/users',
            element: (
              <RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT_TEAM']}>
                <Suspense fallback={<PageLoader />}>
                  <UserList />
                </Suspense>
              </RoleRoute>
            ),
          },
          {
            path: '/suspensions',
            element: (
              <RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MODERATOR']}>
                <Suspense fallback={<PageLoader />}>
                  <SuspensionsPage />
                </Suspense>
              </RoleRoute>
            ),
          },
          {
            path: '/audit-logs',
            element: (
              <RoleRoute allowedRoles={['SUPER_ADMIN', 'AUDITOR']}>
                <Suspense fallback={<PageLoader />}>
                  <AuditList />
                </Suspense>
              </RoleRoute>
            ),
          },
          {
            path: '/activities',
            element: (
              <RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'AUDITOR']}>
                <Suspense fallback={<PageLoader />}>
                  <ActivityMonitor />
                </Suspense>
              </RoleRoute>
            ),
          },
          {
            path: '/settings',
            element: (
              <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                <Suspense fallback={<PageLoader />}>
                  <SettingsLayout />
                </Suspense>
              </RoleRoute>
            ),
          },
          {
            path: '/analytics',
            element: (
              <RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'AUDITOR']}>
                <Suspense fallback={<PageLoader />}>
                  <AdminAnalytics />
                </Suspense>
              </RoleRoute>
            ),
          },
          {
            path: '*',
            element: <Navigate to="/" replace />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);
