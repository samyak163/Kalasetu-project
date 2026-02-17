import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Core Layout & Pages
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

// Artisan Pages (lazy)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ArtisanProfilePage = lazy(() => import('./pages/ArtisanProfilePage'));
const ArtisanAccountPage = lazy(() => import('./pages/ArtisanAccountPage'));
const ArtisanProfileEditor = lazy(() => import('./pages/ArtisanProfileEditor'));

// --- NEW USER PAGES ---
const UserLoginPage = lazy(() => import('./pages/UserLoginPage'));
const UserRegisterPage = lazy(() => import('./pages/UserRegisterPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const PhoneOTPPage = lazy(() => import('./pages/PhoneOTPPage'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const UserDashboard = lazy(() => import('./pages/dashboard/user/UserDashboard'));
const UserDashboardHome = lazy(() => import('./pages/dashboard/user/UserDashboardHome'));
const UserBookings = lazy(() => import('./pages/dashboard/user/UserBookings'));
const UserPayments = lazy(() => import('./pages/dashboard/user/UserPayments'));
const UserPreferences = lazy(() => import('./pages/dashboard/user/Preferences'));
const UserSupport = lazy(() => import('./pages/dashboard/user/Support'));

// Unified selectors (lazy)
const AuthSelector = lazy(() => import('./pages/AuthSelector'));
const RegisterSelector = lazy(() => import('./pages/RegisterSelector'));

// --- POLICY PAGES --- (lazy — rarely accessed)
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const CancellationRefund = lazy(() => import('./pages/CancellationRefund'));

// --- MESSAGING PAGE --- (lazy)
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));

// --- VIDEO CALL PAGE --- (lazy)
const VideoCallPage = lazy(() => import('./pages/VideoCallPage'));
const CallsHistory = lazy(() => import('./pages/dashboard/artisan/CallsHistory'));

// Auth Components
import RequireAuth from './components/RequireAuth';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminLayout from './components/admin/AdminLayout';

// Admin pages (lazy — only admins load these, keeps main bundle smaller)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminArtisans = lazy(() => import('./pages/admin/AdminArtisans'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminRefunds = lazy(() => import('./pages/admin/AdminRefunds'));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));

function App() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-600">Loading...</div>}>
      <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path=":publicId" element={<ArtisanProfilePage />} />
        <Route path="artisan/:publicId" element={<ArtisanProfilePage />} />

        {/* Unified Auth Selectors */}
        <Route path="login" element={<AuthSelector />} />
        <Route path="register" element={<RegisterSelector />} />

        {/* Direct Artisan Auth Routes */}
        <Route path="artisan/login" element={<LoginPage />} />
        <Route path="artisan/register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
  {/* Firebase Auth helper pages */}
  <Route path="phone-otp" element={<PhoneOTPPage />} />
  <Route path="verify-email" element={<VerifyEmail />} />
        
        {/* USER Auth Routes (NEW) */}
        <Route path="user/login" element={<UserLoginPage />} />
        <Route path="user/register" element={<UserRegisterPage />} />
        <Route path="user/forgot-password" element={<ForgotPassword USER />} />

        {/* Policy Pages */}
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsConditions />} />
        <Route path="shipping" element={<ShippingPolicy />} />
        <Route path="refunds" element={<CancellationRefund />} />

        {/* Protected Artisan Routes */}
        <Route
          path="artisan/dashboard"
          element={
            <RequireAuth role="artisan">
              <ArtisanAccountPage />
            </RequireAuth>
          }
        />

        {/* Artisan Profile Editor (Protected) */}
        <Route
          path="artisan/dashboard/profile-editor"
          element={
            <RequireAuth role="artisan">
              <ArtisanProfileEditor />
            </RequireAuth>
          }
        />

        {/* Legacy route: redirect /artisan/dashboard/account to /artisan/dashboard */}
        <Route
          path="artisan/dashboard/account"
          element={
            <RequireAuth role="artisan">
              <ArtisanAccountPage />
            </RequireAuth>
          }
        />

        {/* Search Results */}
        <Route path="search" element={<SearchResults />} />
        {/* Graceful alias to prevent 404s when clicking a generic Services link */}
        <Route path="services" element={<SearchResults />} />

        {/* Messages Page (Protected - Both artisans and users) */}
        <Route 
          path="messages" 
          element={
            <RequireAuth>
              <MessagesPage />
            </RequireAuth>
          } 
        />

        {/* Chat aliases */}
        <Route path="artisan/chat" element={<RequireAuth role="artisan"><MessagesPage /></RequireAuth>} />
        <Route path="user/chat" element={<RequireAuth role="user"><MessagesPage /></RequireAuth>} />

        {/* Video Call Page (Protected - Both artisans and users) */}
        <Route 
          path="video-call" 
          element={
            <RequireAuth>
              <VideoCallPage />
            </RequireAuth>
          } 
        />
        {/* Calls alias */}
        <Route path="artisan/calls" element={<RequireAuth role="artisan"><VideoCallPage /></RequireAuth>} />
        <Route path="artisan/calls/history" element={<RequireAuth role="artisan"><CallsHistory /></RequireAuth>} />

        {/* USER Profile (Protected) */}
        <Route
          path="profile"
          element={
            <RequireAuth role="user">
              <UserProfilePage />
            </RequireAuth>
          }
        />
        {/* USER Dashboard */}
        <Route path="dashboard" element={<RequireAuth role="user"><UserDashboard /></RequireAuth>}>
          <Route index element={<UserDashboardHome />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="payments" element={<UserPayments />} />
          <Route path="preferences" element={<UserPreferences />} />
          <Route path="support" element={<UserSupport />} />
        </Route>
        
        {/* USER protected routes can be added here in future releases */}

      </Route>
      {/* Admin Routes (separate from main site layout) */}
      <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
      <Route path="/admin/*" element={
        <AdminAuthProvider>
          <AdminLayout>
            <Routes>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="artisans" element={<AdminArtisans />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="refunds" element={<AdminRefunds />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Routes>
          </AdminLayout>
        </AdminAuthProvider>
      } />
    </Routes>
    </Suspense>
  );
}

export default App;

