import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // <-- Import our new useAuth hook

const LoginPage = () => {
    // A smarter way to handle forms: use a single state object
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth(); // <-- Get the global login function from our context

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/api/artisans/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to login');
            }
            
            // On success, call the GLOBAL login function with the user's data
            login(data);
            navigate('/'); // Redirect to the homepage

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-bold text-center text-[#1A1A1A] mb-6">Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                        <input type="email" id="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233]" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233]" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#A55233] text-white py-2 rounded-lg hover:bg-[#8e462b] transition-colors font-bold disabled:bg-gray-400">
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-4">
                    Don't have an account? <Link to="/register" className="font-bold text-[#A55233] hover:underline">Register Now</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;