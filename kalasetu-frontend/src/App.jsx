import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import components and pages
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ArtisanProfilePage from './pages/ArtisanProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="artisan/:id" element={<ArtisanProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;