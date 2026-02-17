import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-[#A55233]/10 text-[#A55233]'
      : 'text-gray-700 hover:bg-gray-100'
  }`;

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6 min-h-[60vh]">
        <aside className="w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            <div className="px-3 py-2 mb-3">
              <div className="font-semibold text-gray-900 truncate">{user?.fullName || 'My Account'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
            <NavLink to="/dashboard" end className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/dashboard/bookings" className={navLinkClass}>My Bookings</NavLink>
            <NavLink to="/dashboard/payments" className={navLinkClass}>Payments</NavLink>
            <NavLink to="/dashboard/preferences" className={navLinkClass}>Preferences</NavLink>
            <NavLink to="/dashboard/support" className={navLinkClass}>Support</NavLink>
            <button
              onClick={() => navigate('/profile')}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              View My Profile
            </button>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
