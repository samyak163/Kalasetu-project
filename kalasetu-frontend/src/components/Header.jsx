import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
// Use absolute path
import { AuthContext } from '/src/context/AuthContext.jsx';
import { Icons } from './Icons.jsx'; // Assuming you have Icons defined here

const Header = () => {
  const { auth, logout } = useContext(AuthContext);

  const renderAuthLinks = () => {
    // Case 1: No one is logged in
    if (!auth.user) {
      return (
        <>
          <Link to="/customer/login" className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">
            Sign In
          </Link>
          <Link
            to="/customer/register"
            className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#A55233] hover:bg-[#8e462b] transition-colors"
          >
            Create Account
          </Link>
        </>
      );
    }

    // Case 2: A Customer is logged in
    if (auth.userType === 'user') {
      return (
        <>
          <span className="text-sm font-medium text-gray-700">Hi, {auth.user.fullName.split(' ')[0]}</span>
          {/* TODO: Link to customer profile page */}
          {/* <Link to="/my-profile" className="ml-4 text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">My Profile</Link> */}
          <button
            onClick={logout}
            className="ml-4 text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors"
          >
            Sign Out
          </button>
        </>
      );
    }

    // Case 3: An Artisan is logged in
    if (auth.userType === 'artisan') {
      return (
        <>
          <Link to={`/${auth.user.publicId}`} className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">
            My Profile
          </Link>
          <Link to="/dashboard" className="ml-4 text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">
            Dashboard
          </Link>
          <button
            onClick={logout}
            className="ml-4 text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors"
          >
            Sign Out
          </button>
        </>
      );
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-[#A55233]">
              Kala<span className="text-gray-800">Setu</span>
            </Link>
            {/* Main Nav (for customers) */}
            <div className="hidden ml-10 space-x-8 lg:block">
              <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">
                Home
              </Link>
              {/* TODO: Add these routes later
                <Link to="/explore" className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">
                  Explore Artisans
                </Link>
                <Link to="/about" className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">
                  About Us
                </Link> 
              */}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             {/* Artisan Portal Link */}
             <div className="hidden sm:block">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors border-r border-gray-300 pr-4">
                For Artisans
              </Link>
             </div>
             
            {/* Auth Links (Dynamic) */}
            <div className="flex items-center">
              {renderAuthLinks()}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

