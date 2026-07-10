import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from '../components/security/RoleRoute';
import { Forbidden } from '../pages/Forbidden';

// Lazy loaded feature modules
const Login = React.lazy(() => import('../features/auth/components/Login').then(module => ({ default: module.Login })));
const Dashboard = React.lazy(() => import('../features/dashboard/components/Dashboard').then(module => ({ default: module.Dashboard })));
const UserList = React.lazy(() => import('../features/users/components/UserList').then(module => ({ default: module.UserList })));
const AuditList = React.lazy(() => import('../features/audit/components/AuditList').then(module => ({ default: module.AuditList })));
const SettingsLayout = React.lazy(() => import('../features/settings/components/SettingsLayout').then(module => ({ default: module.SettingsLayout })));
const AdminAnalytics = React.lazy(() => import('../features/analytics/components/AdminAnalytics').then(module => ({ default: module.AdminAnalytics })));

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
        path: '/403',
        element: <Forbidden />,
      }
    ]
  },
  {
    element: <ProtectedRoute />,
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
