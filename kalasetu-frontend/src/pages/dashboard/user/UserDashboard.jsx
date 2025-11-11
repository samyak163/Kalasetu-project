import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="flex min-h-[60vh]">
      <aside className="w-56 border-r border-gray-200 p-4 space-y-2">
        <Link to="/dashboard/preferences" className="block hover:underline">Preferences</Link>
        <Link to="/dashboard/support" className="block hover:underline">Support</Link>
        <button
          onClick={handleViewProfile}
          className="block w-full text-left px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors font-medium"
        >
          👤 View My Profile
        </button>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserDashboard;


