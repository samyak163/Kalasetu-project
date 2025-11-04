import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import ProfileDropdown from './common/ProfileDropdown.jsx';
import SearchBar from './SearchBar.jsx';
import ProfileModal from './profile/ProfileModal.jsx';

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const renderAuthLinks = () => {
    if (!auth.user) {
      return (
        <>
          <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">
            Login
          </Link>
          <Link
            to="/register"
            className="ml-4 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#A55233] hover:bg-[#8e462b] transition-colors"
          >
            Sign Up as Customer
          </Link>
        </>
      );
    }

    if (auth.userType === 'user') {
      return (
        <ProfileDropdown
          user={auth.user}
          onLogout={logout}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      );
    }

    if (auth.userType === 'artisan') {
      return (
        <ProfileDropdown
          user={auth.user}
          onLogout={logout}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      );
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold text-[#A55233]">
              {auth.userType === 'artisan' ? 'KalaSetu Artisan' : 'Kala'}<span className="text-gray-800">{auth.userType === 'artisan' ? '' : 'Setu'}</span>
            </Link>
            <div className="hidden md:flex">
              <SearchBar />
            </div>
            <div className="hidden lg:flex items-center gap-6">
              {auth.userType !== 'artisan' && (
                <>
                  <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-[#A55233]">Home</Link>
                  <Link to="#" className="text-sm font-semibold text-gray-700 hover:text-[#A55233]">Services</Link>
                  <Link to="#" className="text-sm font-semibold text-gray-700 hover:text-[#A55233]">How it Works</Link>
                  <Link to="/artisan/login" className="text-sm font-semibold text-gray-700 hover:text-[#A55233]">For Artisans</Link>
                </>
              )}
              {auth.userType === 'artisan' && (
                <>
                  <Link to="/dashboard" className="text-sm font-semibold text-gray-700 hover:text-[#A55233]">Dashboard</Link>
                  <Link to="/dashboard/account" className="text-sm font-semibold text-gray-700 hover:text-[#A55233]">Jobs</Link>
                  <Link to="/messages" className="text-sm font-semibold text-gray-700 hover:text-[#A55233]">Chat</Link>
                  <Link to="/video-call" className="text-sm font-semibold text-gray-700 hover:text-[#A55233]">Calls</Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications placeholder */}
            {auth.user && (
              <button type="button" className="hidden sm:inline-flex relative h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">
                <span className="text-lg">🔔</span>
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">2</span>
              </button>
            )}
            <div className="flex items-center">
              {renderAuthLinks()}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={auth.user}
          userType={auth.userType}
        />
      )}
    </header>
  );
};

export default Header;

