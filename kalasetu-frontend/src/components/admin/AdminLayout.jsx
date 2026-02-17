import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import AdminGlobalSearch from './AdminGlobalSearch.jsx';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Star,
  DollarSign,
  RefreshCcw,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const { admin, isAuthenticated, loading, logout } = useAdminAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', permission: ['analytics', 'view'] },
    { name: 'Artisans', icon: Briefcase, path: '/admin/artisans', permission: ['artisans', 'view'] },
    { name: 'Users', icon: Users, path: '/admin/users', permission: ['users', 'view'] },
    { name: 'Reviews', icon: Star, path: '/admin/reviews', permission: ['reviews', 'view'] },
    { name: 'Payments', icon: DollarSign, path: '/admin/payments', permission: ['payments', 'view'] },
    { name: 'Refunds', icon: RefreshCcw, path: '/admin/refunds', permission: ['payments', 'refund'] },
    { name: 'Bookings', icon: MessageSquare, path: '/admin/bookings', permission: ['bookings', 'view'] },
    { name: 'Settings', icon: Settings, path: '/admin/settings', permission: ['settings', 'view'] }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && (<h1 className="text-xl font-bold">KalaSetu Admin</h1>)}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-brand-500 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                title={!sidebarOpen ? item.name : ''}
              >
                <Icon size={20} />
                {sidebarOpen && (<span className="font-medium">{item.name}</span>)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <AdminGlobalSearch />
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Notifications">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <img src={admin?.profileImage || '/default-avatar.png'} alt={admin?.fullName} className="w-8 h-8 rounded-full object-cover" />
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-700">{admin?.fullName}</p>
                    <p className="text-xs text-gray-500 capitalize">{admin?.role?.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      Settings
                    </Link>
                    <hr className="my-2" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;


