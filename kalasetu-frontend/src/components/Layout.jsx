import React from 'react';
import { Outlet } from 'react-router-dom';

// We import the Header and Footer from their specific files
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ProfileModal from './profile/ProfileModal.jsx';

// This component acts as the master template for our pages.
// The <Outlet /> is the special placeholder where the router will render
// the current page's content (e.g., HomePage, LoginPage).
const Layout = () => {
    return (
        <div className="bg-white dark:bg-gray-900 font-sans transition-colors">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-500 focus:text-white focus:rounded-md focus:m-2">Skip to main content</a>
            <Header />
            <main id="main-content">
                <Outlet />
            </main>
            <Footer />
            <ProfileModal />
        </div>
    );
};

export default Layout;