import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ArtisanProfilePage from './pages/ArtisanProfilePage.jsx';
import ArtisanDashboardPage from './pages/ArtisanDashboardPage.jsx';

// This is the final version of our application's router.
function App() {
  return (
    <Routes>
      {/* All our main pages live inside the master Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="dashboard" element={<ArtisanDashboardPage />} />
        
        {/* THE FINAL UPGRADE: The new Public Vanity URL Route! */}
        {/* This route will match URLs like /ks_a1b2c3d4 */}
        <Route path=":publicId" element={<ArtisanProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;