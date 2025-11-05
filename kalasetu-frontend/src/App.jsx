import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Core Layout & Pages
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';

// Artisan Pages (lazy)
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const ArtisanProfilePage = lazy(() => import('./pages/ArtisanProfilePage.jsx'));
const ArtisanDashboardPage = lazy(() => import('./pages/ArtisanDashboardPage.jsx'));
const ArtisanAccountPage = lazy(() => import('./pages/ArtisanAccountPage.jsx'));
const ArtisanProfileEditor = lazy(() => import('./pages/ArtisanProfileEditor.jsx'));

// --- NEW USER PAGES --- (lazy)
const UserLoginPage = lazy(() => import('./pages/UserLoginPage.jsx'));
const UserRegisterPage = lazy(() => import('./pages/UserRegisterPage.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const PhoneOTPPage = lazy(() => import('./pages/PhoneOTPPage.jsx'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage.jsx'));
const UserDashboard = lazy(() => import('./pages/dashboard/user/UserDashboard.jsx'));
const UserPreferences = lazy(() => import('./pages/dashboard/user/Preferences.jsx'));
const UserSupport = lazy(() => import('./pages/dashboard/user/Support.jsx'));

// Unified selectors (lazy)
const AuthSelector = lazy(() => import('./pages/AuthSelector.jsx'));
const RegisterSelector = lazy(() => import('./pages/RegisterSelector.jsx'));

// --- POLICY PAGES ---
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsConditions from './pages/TermsConditions.jsx';
import ShippingPolicy from './pages/ShippingPolicy.jsx';
import CancellationRefund from './pages/CancellationRefund.jsx';

// --- MESSAGING PAGE --- (lazy)
const MessagesPage = lazy(() => import('./pages/MessagesPage.jsx'));
const SearchResults = lazy(() => import('./pages/SearchResults.jsx'));

// --- VIDEO CALL PAGE --- (lazy)
const VideoCallPage = lazy(() => import('./pages/VideoCallPage.jsx'));
const Bookings = lazy(() => import('./pages/dashboard/artisan/Bookings.jsx'));
const CallsHistory = lazy(() => import('./pages/dashboard/artisan/CallsHistory.jsx'));

// Auth Components
import RequireAuth from './components/RequireAuth.jsx';

function App() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-600">Loading...</div>}>
      <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path=":publicId" element={<ArtisanProfilePage />} />

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
            // This now checks if the logged-in user is an 'artisan'
            <RequireAuth role="artisan">
              <ArtisanDashboardPage />
            </RequireAuth>
          } 
        />
        {/* Artisan Bookings */}
        <Route
          path="artisan/dashboard/bookings"
          element={
            <RequireAuth role="artisan">
              <Bookings />
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

        {/* Artisan Account (Profile + tabs) */}
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

        {/* Messages Page (Protected - Both artisans and USERs) */}
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

        {/* Video Call Page (Protected - Both artisans and USERs) */}
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
          <Route path="preferences" element={<UserPreferences />} />
          <Route path="support" element={<UserSupport />} />
        </Route>
        
        {/* USER protected routes can be added here in future releases */}

      </Route>
    </Routes>
    </Suspense>
  );
}

export default App;

