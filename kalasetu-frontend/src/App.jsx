import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import our new components and pages
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ArtisanProfilePage from './pages/ArtisanProfilePage';

function App() {
  return (
    <Routes>
      {/* All pages will now use the main Layout (Header and Footer) */}
      <Route path="/" element={<Layout />}>
        {/* The Outlet in Layout will render these child routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        
        {/* This is a dynamic route. ':id' is a placeholder for the artisan's unique ID. */}
        <Route path="artisan/:id" element={<ArtisanProfilePage />} />

        {/* You can add more placeholder routes for other pages here */}
        {/* e.g., <Route path="about" element={<div>About Us Page</div>} /> */}
      </Route>
    </Routes>
  );
}

export default App;
