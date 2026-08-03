import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Lazy load components for performance optimization (Code Splitting)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Suspended = lazy(() => import('./pages/Suspended'));
const OAuth2RedirectHandler = lazy(() => import('./pages/OAuth2RedirectHandler'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ActivityHistory = lazy(() => import('./pages/ActivityHistory'));
const LogActivity = lazy(() => import('./pages/LogActivity'));
const LogElectricity = lazy(() => import('./pages/LogElectricity'));
const Profile = lazy(() => import('./pages/Profile'));
const Badges = lazy(() => import('./pages/Badges'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Goals = lazy(() => import('./pages/Goals'));
const GoalDashboard = lazy(() => import('./pages/GoalDashboard'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const Benchmarking = lazy(() => import('./pages/Benchmarking'));
const PointsHistory = lazy(() => import('./pages/PointsHistory'));
const PointsGuide = lazy(() => import('./pages/PointsGuide'));
const SupportTickets = lazy(() => import('./pages/support/SupportTickets'));
const CreateTicketPage = lazy(() => import('./pages/support/CreateTicketPage'));
const TicketSuccess = lazy(() => import('./pages/support/TicketSuccess'));
const SupportTicketDetail = lazy(() => import('./pages/support/SupportTicketDetail'));
const AdminBadgeManagement = lazy(() => import('./pages/admin/AdminBadgeManagement'));
const AdminBadgeForm = lazy(() => import('./pages/admin/AdminBadgeForm'));

// Global Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FBFBFC]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <NotificationProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'text-sm font-medium text-slate-900 shadow-lg border border-slate-100',
            duration: 4000,
            style: {
              background: '#fff',
              color: '#0f172a',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/suspended" element={<Suspended />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="activities" element={<ActivityHistory />} />
          <Route path="activity-history" element={<ActivityHistory />} />
          <Route path="log-activity" element={<LogActivity />} />
          <Route path="log-electricity" element={<LogElectricity />} />
          <Route path="profile" element={<Profile />} />
          <Route path="badges" element={<Badges />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="goals" element={<Goals />} />
          <Route path="goals/:id" element={<GoalDashboard />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="benchmarking" element={<Benchmarking />} />
          <Route path="points-history" element={<PointsHistory />} />
          <Route path="points-guide" element={<PointsGuide />} />
          <Route path="support" element={<SupportTickets />} />
          <Route path="support/new" element={<CreateTicketPage />} />
          <Route path="support/success" element={<TicketSuccess />} />
          <Route path="support/:id" element={<SupportTicketDetail />} />
          
          {/* Admin Routes */}
          <Route path="admin/badges" element={<AdminBadgeManagement />} />
          <Route path="admin/badges/create" element={<AdminBadgeForm />} />
          <Route path="admin/badges/edit/:id" element={<AdminBadgeForm />} />
        </Route>
        <Route path="/complete-profile" element={<CompleteProfile />} />
            </Route>

            {/* Default Route */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
