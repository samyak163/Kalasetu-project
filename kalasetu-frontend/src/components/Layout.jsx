import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ProfileModal from './profile/ProfileModal.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

const Layout = () => {
    return (
        <div className="bg-white dark:bg-gray-900 font-sans transition-colors">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-500 focus:text-white focus:rounded-md focus:m-2">Skip to main content</a>
            <Header />
            <main id="main-content">
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </main>
            <Footer />
            <ProfileModal />
        </div>
    );
};

export default Layout;
