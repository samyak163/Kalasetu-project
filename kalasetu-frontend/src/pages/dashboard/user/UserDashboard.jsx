import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const UserDashboard = () => {
  return (
    <div className="flex min-h-[60vh]">
      <aside className="w-56 border-r border-gray-200 p-4 space-y-2">
        <Link to="/dashboard/preferences" className="block hover:underline">Preferences</Link>
        <Link to="/dashboard/support" className="block hover:underline">Support</Link>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserDashboard;


