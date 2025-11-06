import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const ProfileDropdown = ({ user, userType, onLogout, onOpenProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    setIsOpen(false);
    if (globalThis.confirm('Are you sure you want to sign out?')) {
      await onLogout();
    }
  };

  const handleOpenProfileTab = (tab = 'profile') => {
    // Close dropdown immediately
    setIsOpen(false);
    
    // For artisans, navigate directly without delays
    if (userType === 'artisan') {
      if (typeof onOpenProfile === 'function') {
        onOpenProfile();
      } else {
        // Fallback: navigate directly
        window.location.href = '/artisan/dashboard/account';
      }
      return;
    }
    
    // For users, dispatch event synchronously
    if (userType === 'user') {
      const event = new CustomEvent('open-profile', { detail: { tab } });
      globalThis.dispatchEvent(event);
    }
  };

  const avatarUrl = user?.profileImageUrl || '';
  const displayName = user?.fullName || 'User';
  const truncatedName = displayName.length > 15 
    ? `${displayName.substring(0, 15)}...` 
    : displayName;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:ring-offset-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Profile menu"
      >
        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="h-full w-full bg-[#A55233] text-white flex items-center justify-center text-sm font-semibold"
            style={{ display: avatarUrl ? 'none' : 'flex' }}
          >
            {getInitials(displayName)}
          </div>
        </div>
        <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[160px] truncate">
          {truncatedName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in"
          role="menu"
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="h-full w-full bg-[#A55233] text-white flex items-center justify-center text-sm font-semibold"
                  style={{ display: avatarUrl ? 'none' : 'flex' }}
                >
                  {getInitials(displayName)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">Signed in as</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleOpenProfileTab('profile')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
              role="menuitem"
            >
              View Profile
            </button>
            <button
              onClick={() => handleOpenProfileTab('preferences')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
              role="menuitem"
            >
              Settings
            </button>
            <button
              onClick={() => handleOpenProfileTab('help')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
              role="menuitem"
            >
              Help & Support
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Sign Out */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
              role="menuitem"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

ProfileDropdown.propTypes = {
  user: PropTypes.shape({
    fullName: PropTypes.string,
    profileImageUrl: PropTypes.string,
    email: PropTypes.string,
  }),
  userType: PropTypes.oneOf(['user', 'artisan']).isRequired,
  onLogout: PropTypes.func.isRequired,
  onOpenProfile: PropTypes.func,
};
