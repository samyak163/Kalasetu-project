import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // We use this to check if a user is logged in

const Header = () => {
    const { user, logout } = useAuth(); // Get the user and the logout function

    return (
        <header className="bg-[#1A1A1A] text-white py-4 px-8 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center max-w-7xl">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-[#A55233]">Kala<span className="text-white">Setu</span></Link>
                
                {/* Main Navigation - Restored to its original state */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="hover:text-[#A55233] transition-colors">Home</Link>
                    <Link to="/categories" className="hover:text-[#A55233] transition-colors">Categories</Link>
                    <Link to="/about" className="hover:text-[#A55233] transition-colors">About Us</Link>
                </nav>
                
                {/* Dynamic Auth Section */}
                <div className="flex items-center space-x-4">
                    {user ? (
                        // --- IF A USER IS LOGGED IN ---
                        // We show their name (as a link to their profile) AND a logout button.
                        <>
                            <Link to={`/${user.publicId}`} className="font-semibold hidden sm:block hover:text-[#A55233] transition-colors">
                                Welcome, {user.fullName.split(' ')[0]}
                            </Link>
                            <button onClick={logout} className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-bold">
                                Logout
                            </button>
                        </>
                    ) : (
                        // --- IF NO USER IS LOGGED IN ---
                        // We show the original "For Artisans" and "Login" buttons.
                        <>
                            <Link to="/for-artisans" className="hidden md:block border border-white px-4 py-2 rounded-md hover:bg-white hover:text-[#1A1A1A] transition-colors text-sm">
                                For Artisans
                            </Link>
                            <Link to="/login" className="bg-[#A55233] px-4 py-2 rounded-md hover:bg-[#8e462b] transition-colors text-sm">
                                Login / Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;