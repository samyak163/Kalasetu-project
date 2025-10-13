import React from 'react';
import { Routes, Route } from 'react-router-dom';

// THE FIX: Added .jsx extensions to all local imports
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ArtisanProfilePage from './pages/ArtisanProfilePage.jsx';

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