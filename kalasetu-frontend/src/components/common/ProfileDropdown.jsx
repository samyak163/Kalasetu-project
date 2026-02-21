import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Avatar } from '../ui';

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

  const handleLogout = async () => {
    setIsOpen(false);
    await onLogout();
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
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Profile menu"
      >
        <Avatar name={displayName} src={avatarUrl} size="sm" />
        <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[160px] truncate">
          {truncatedName}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in"
          role="menu"
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar name={displayName} src={avatarUrl} size="md" />
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
              <User className="w-4 h-4 mr-2 inline" />View Profile
            </button>
            <button
              onClick={() => handleOpenProfileTab('preferences')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
              role="menuitem"
            >
              <Settings className="w-4 h-4 mr-2 inline" />Settings
            </button>
            <button
              onClick={() => handleOpenProfileTab('help')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
              role="menuitem"
            >
              <HelpCircle className="w-4 h-4 mr-2 inline" />Help & Support
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Sign Out */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-error-600 hover:bg-error-50 transition-colors focus:outline-none focus:bg-error-50"
              role="menuitem"
            >
              <LogOut className="w-4 h-4 mr-2 inline" />Sign Out
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
