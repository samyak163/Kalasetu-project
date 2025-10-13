import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const ArtisanDashboardPage = () => {
    const { user, logout } = useAuth(); // Get the user object and the logout function from our global state
    const navigate = useNavigate();

    // The function that will be called when the logout button is clicked
    const handleLogout = () => {
        logout(); // This clears the user from our global state
        navigate('/'); // This redirects the user back to the homepage
    };
    
    // THE UPGRADE: We construct the user's full, shareable public profile URL.
    // window.location.origin gives us the base URL (e.g., "http://localhost:5173" or "https://kalasetu.vercel.app")
    const publicProfileUrl = `${window.location.origin}/${user?.publicId}`;

    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-4xl font-bold text-[#1A1A1A] mb-8">
                    Welcome, {user ? user.fullName : 'Artisan'}!
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-[#A55233] mb-6">Your Dashboard</h2>
                        
                        {/* THE UPGRADE: Displaying the public URL */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-800 mb-2">Your Personal Profile URL</h3>
                            <p className="text-sm text-gray-600 mb-2">Share this link with your customers! This is your digital storefront.</p>
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <a 
                                    href={publicProfileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-600 hover:underline break-all font-mono"
                                >
                                    {publicProfileUrl}
                                </a>
                            </div>
                        </div>

                        <p className="text-gray-700">Here you can manage your profile, view your reviews, and more.</p>
                    </div>

                    {/* Sidebar with Actions */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Account Actions</h2>
                            {/* THE UPGRADE: The logout button is now here. */}
                            <button 
                                onClick={handleLogout} 
                                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-bold"
                            >
                                Logout
                            </button>
                        </div>
                         <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Coming Soon</h2>
                            <p className="text-gray-600">Features like "Edit Profile" and "View Reviews" will be available here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtisanDashboardPage;