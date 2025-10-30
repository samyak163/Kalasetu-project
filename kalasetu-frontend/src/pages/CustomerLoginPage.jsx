import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// FIX: Changed to an absolute path from the project root, which is more robust.
import { AuthContext } from '/src/context/AuthContext.jsx';

const CustomerLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { userLogin } = useContext(AuthContext); // Using the new function
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // This function will call POST /api/users/login
            await userLogin({ email, password });
            navigate('/'); // Go to homepage on successful login
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link to="/" className="text-3xl font-bold text-[#A55233]">Kala<span className="text-gray-800">Setu</span></Link>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:border-transparent transition-all duration-200"
                                placeholder="Enter your email address"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:border-transparent transition-all duration-200"
                                placeholder="Enter your password"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-[#A55233] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#8e462b] focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            New to KalaSetu?{' '}
                            <Link to="/customer/register" className="font-semibold text-[#A55233] hover:text-[#8e462b] transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerLoginPage;

