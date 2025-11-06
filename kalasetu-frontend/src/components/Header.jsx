import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import ArtisanInfoModal from './ArtisanInfoModal.jsx';
import HowItWorksModal from './HowItWorksModal.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import ProfileDropdown from './common/ProfileDropdown.jsx';
import ProfileModal from './profile/ProfileModal.jsx';

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const { notifications, unreadCount } = useNotifications();
  const [showArtisanInfo, setShowArtisanInfo] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleOpenProfile = () => {
    // Only artisans use this handler (users open modal from ProfileDropdown directly)
    if (auth.userType === 'artisan') {
      globalThis.location.href = '/artisan/dashboard/account';
    }
  };

  const renderAuthLinks = () => {
    // Case 1: No one is logged in
    if (!auth.user) {
      return (
        <>
          <Link to="/user/login" className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">Sign In</Link>
          <Link to="/register" className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#A55233] hover:bg-[#8e462b] transition-colors">Sign Up</Link>
        </>
      );
    }

    // Case 2: User or Artisan is logged in - use ProfileDropdown
    return (
      <ProfileDropdown 
        user={auth.user}
        userType={auth.userType}
        onLogout={logout}
        onOpenProfile={handleOpenProfile}
      />
    );
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
            {/* Main Nav */}
            <div className="hidden ml-10 space-x-8 lg:block">
              <Link to="/category" className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">Services</Link>
              <button type="button" onClick={() => setShowHowItWorks(true)} className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">How It Works</button>
              <button type="button" onClick={() => setShowArtisanInfo(true)} className="text-sm font-semibold text-gray-700 hover:text-[#A55233] transition-colors">For Artisans</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowNotifications(true)} aria-label="Notifications" className="relative text-gray-700 hover:text-[#A55233]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-3 px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
            </button>
            {/* Chat & Call buttons - for both users and artisans */}
            {auth.user && (
              <>
                <Link
                  to={auth.userType === 'artisan' ? '/artisan/chat' : '/messages'}
                  className="relative p-2 text-gray-700 hover:text-[#A55233] transition-colors"
                  aria-label="Chat"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>
                <Link
                  to={auth.userType === 'artisan' ? '/artisan/calls' : '/video-call'}
                  className="relative p-2 text-gray-700 hover:text-[#A55233] transition-colors"
                  aria-label="Calls"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </Link>
              </>
            )}
            {/* Auth Links (Dynamic) */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
              {renderAuthLinks()}
            </div>
          </div>
        </div>
      </nav>
      {/* Modals */}
      <ArtisanInfoModal isOpen={showArtisanInfo} onClose={() => setShowArtisanInfo(false)} />
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} />
      <ProfileModal />
    </header>
  );
};

export default Header;

