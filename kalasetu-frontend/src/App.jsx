import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx'; // <-- Import the new page
import ArtisanProfilePage from './pages/ArtisanProfilePage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} /> {/* <-- Add the new route */}
        <Route path="artisan/:id" element={<ArtisanProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;