import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import our layout and all the pages
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ArtisanProfilePage from './pages/ArtisanProfilePage.jsx';

// This component is the master "switchboard". It defines all the URL paths
// and which page component to show for each path.
function App() {
  return (
    <Routes>
      {/* This parent route uses the Layout component, which includes the Header and Footer. */}
      <Route path="/" element={<Layout />}>
        {/* The 'index' route is the default page shown inside the Layout's <Outlet> */}
        <Route index element={<HomePage />} />
        
        {/* Other pages that will also appear inside the Layout */}
        <Route path="login" element={<LoginPage />} />
        <Route path="artisan/:id" element={<ArtisanProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;