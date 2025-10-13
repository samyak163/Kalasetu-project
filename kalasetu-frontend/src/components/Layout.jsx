import React from 'react';
import { Outlet } from 'react-router-dom';

// We import the Header and Footer from their specific files
import Header from './Header.jsx';
import Footer from './Footer.jsx';

// This component acts as the master template for our pages.
// The <Outlet /> is the special placeholder where the router will render
// the current page's content (e.g., HomePage, LoginPage).
const Layout = () => {
    return (
        <div className="bg-white font-sans">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;