import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Core Layout & Pages
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';

// Artisan Pages
import LoginPage from './pages/LoginPage.jsx'; // This is now ARTISAN login
import RegisterPage from './pages/RegisterPage.jsx'; // This is now ARTISAN register
import ArtisanProfilePage from './pages/ArtisanProfilePage.jsx';
import ArtisanDashboardPage from './pages/ArtisanDashboardPage.jsx';

// --- NEW CUSTOMER PAGES ---
import CustomerLoginPage from './pages/CustomerLoginPage.jsx';
import CustomerRegisterPage from './pages/CustomerRegisterPage.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

// Auth Components
import RequireAuth from './components/RequireAuth.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path=":publicId" element={<ArtisanProfilePage />} />

        {/* Artisan Auth Routes (For the "Artisan Portal") */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        
        {/* Customer Auth Routes (NEW) */}
        <Route path="customer/login" element={<CustomerLoginPage />} />
        <Route path="customer/register" element={<CustomerRegisterPage />} />
        <Route path="customer/forgot-password" element={<ForgotPassword customer />} />

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
        
        {/* TODO: Add protected customer routes here in the future, e.g.:
          <Route 
            path="my-profile" 
            element={
              <RequireAuth role="user">
                <CustomerProfilePage />
              </RequireAuth>
            } 
          />
        */}

      </Route>
    </Routes>
  );
}

export default App;

