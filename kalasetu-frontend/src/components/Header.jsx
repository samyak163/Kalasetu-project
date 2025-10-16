import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const Header = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/'); // Redirect to homepage after logout
    };

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
                    {/* THE FIX: The "For Artisans" button is now always visible to non-logged-in users */}
                    {!currentUser && (
                         <Link to="/for-artisans" className="hidden md:block border border-white px-4 py-2 rounded-md hover:bg-white hover:text-[#1A1A1A] transition-colors text-sm">
                            For Artisans
                        </Link>
                    )}
                    
                    {currentUser ? (
                        // --- IF A USER IS LOGGED IN ---
                        // We show their name (link to dashboard) AND a logout button.
                        <>
                            <Link to="/dashboard" className="font-semibold hover:text-[#A55233] transition-colors">
                                Welcome, {currentUser.fullName.split(' ')[0]}
                            </Link>
                            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-bold">
                                Logout
                            </button>
                        </>
                    ) : (
                        // --- IF NO USER IS LOGGED IN ---
                        // We show the original "Login / Sign Up" button.
                        <Link to="/login" className="bg-[#A55233] px-4 py-2 rounded-md hover:bg-[#8e462b] transition-colors text-sm">
                            Login / Sign Up
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;