import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', password: '', craft: '', location: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-bold text-center text-[#1A1A1A] mb-6">Join KalaSetu</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                        <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233]" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233]" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                        <input type="tel" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233]" />
                    </div>
                    {/* THE FIX: The username input has been REMOVED */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input type="password" id="password" value={formData.password} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233]" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="craft" className="block text-gray-700 text-sm font-bold mb-2">Your Craft (e.g., Pottery)</label>
                        <input type="text" id="craft" value={formData.craft} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233]" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Location (e.g., Kothrud, Pune)</label>
                        <input type="text" id="location" value={formData.location} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233]" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#A55233] text-white py-2 rounded-lg hover:bg-[#8e462b] transition-colors font-bold disabled:bg-gray-400">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                 <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account? <Link to="/login" className="font-bold text-[#A55233] hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};
export default RegisterPage;