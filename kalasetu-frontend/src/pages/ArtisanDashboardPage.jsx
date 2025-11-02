import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

const ArtisanDashboardPage = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-4xl font-bold text-[#1A1A1A] mb-8">Welcome, {currentUser ? currentUser.fullName : 'Artisan'}!</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-[#A55233] mb-4">Your Public Profile</h2>
                            <p className="text-gray-600 mb-4">This is your digital storefront. Share this link with your customers!</p>
                            <Link to={`/${currentUser?.publicId}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                View Public Profile
                            </Link>
                        </div>
                                                <div className="bg-white p-8 rounded-lg shadow-lg">
                                                        <h2 className="text-2xl font-bold text-[#A55233] mb-4">Manage Your Profile</h2>
                                                        <p className="text-gray-600 mb-4">Keep your information, bio, and portfolio up to date.</p>
                                                        <button
                                                            onClick={() => navigate('/dashboard/account')}
                                                            className="mt-2 bg-[#A55233] text-white py-2 px-4 rounded-lg hover:bg-[#8f472c] transition-colors"
                                                        >
                                                            Edit Profile
                                                        </button>
                                                </div>
                    </div>
                    {/* Sidebar with Logout */}
                    <div className="bg-white p-6 rounded-lg shadow-lg h-fit">
                        <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Account Actions</h2>
                        <button 
                            onClick={handleLogout} 
                            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-bold"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ArtisanDashboardPage;