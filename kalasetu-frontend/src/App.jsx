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

// --- NEW CUSTOMER PAGES --- (lazy)
const CustomerLoginPage = lazy(() => import('./pages/CustomerLoginPage.jsx'));
const CustomerRegisterPage = lazy(() => import('./pages/CustomerRegisterPage.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const PhoneOTPPage = lazy(() => import('./pages/PhoneOTPPage.jsx'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'));
const CustomerProfilePage = lazy(() => import('./pages/CustomerProfilePage.jsx'));

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

// --- VIDEO CALL PAGE --- (lazy)
const VideoCallPage = lazy(() => import('./pages/VideoCallPage.jsx'));

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
        
        {/* Customer Auth Routes (NEW) */}
        <Route path="customer/login" element={<CustomerLoginPage />} />
        <Route path="customer/register" element={<CustomerRegisterPage />} />
        <Route path="customer/forgot-password" element={<ForgotPassword customer />} />

        {/* Policy Pages */}
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsConditions />} />
        <Route path="shipping" element={<ShippingPolicy />} />
        <Route path="cancellation-refund" element={<CancellationRefund />} />

        {/* Protected Artisan Route */}
        <Route 
          path="dashboard" 
          element={
            // This now checks if the logged-in user is an 'artisan'
            <RequireAuth role="artisan">
              <ArtisanDashboardPage />
            </RequireAuth>
          } 
        />

        {/* Artisan Profile Editor (Protected) */}
        <Route 
          path="dashboard/profile-editor" 
          element={
            <RequireAuth role="artisan">
              <ArtisanProfileEditor />
            </RequireAuth>
          } 
        />

        {/* Artisan Account (Profile + tabs) */}
        <Route
          path="dashboard/account"
          element={
            <RequireAuth role="artisan">
              <ArtisanAccountPage />
            </RequireAuth>
          }
        />

        {/* Messages Page (Protected - Both artisans and customers) */}
        <Route 
          path="messages" 
          element={
            <RequireAuth>
              <MessagesPage />
            </RequireAuth>
          } 
        />

        {/* Video Call Page (Protected - Both artisans and customers) */}
        <Route 
          path="video-call" 
          element={
            <RequireAuth>
              <VideoCallPage />
            </RequireAuth>
          } 
        />

        {/* Customer Profile (Protected) */}
        <Route
          path="profile"
          element={
            <RequireAuth role="user">
              <CustomerProfilePage />
            </RequireAuth>
          }
        />
        
        {/* Customer protected routes can be added here in future releases */}

      </Route>
    </Routes>
    </Suspense>
  );
}

export default App;

