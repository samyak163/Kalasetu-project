import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ 
        fullName: '', 
        email: '', 
        phoneNumber: '', 
        password: '',
        useEmail: true // Toggle between email and phone
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { artisanRegister } = useContext(AuthContext);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const toggleAuthMethod = () => {
        setFormData({ ...formData, useEmail: !formData.useEmail });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Prepare registration data based on selected method
            const registrationData = {
                fullName: formData.fullName,
                password: formData.password,
                email: formData.useEmail ? formData.email : '',
                phoneNumber: formData.useEmail ? '' : formData.phoneNumber
            };

            await artisanRegister(registrationData);
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            let errorMessage = 'Registration failed';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 400) {
                errorMessage = 'Invalid input data. Please check all fields.';
            } else if (err.response?.status === 409) {
                errorMessage = 'Email or phone number already exists.';
            } else if (err.response?.status === 0) {
                errorMessage = 'Cannot connect to server. Please check your internet connection.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join our community of artisans
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input 
                                type="text" 
                                id="fullName" 
                                value={formData.fullName} 
                                onChange={handleChange} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:border-transparent transition-all duration-200"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Authentication Method Toggle */}
                        <div className="flex items-center justify-center space-x-4">
                            <button
                                type="button"
                                onClick={toggleAuthMethod}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    formData.useEmail 
                                        ? 'bg-[#A55233] text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={toggleAuthMethod}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    formData.useEmail 
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        : 'bg-[#A55233] text-white'
                                }`}
                            >
                                Phone
                            </button>
                        </div>

                        {/* Email or Phone Input */}
                        {formData.useEmail ? (
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your email address"
                                />
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input 
                                    type="tel" 
                                    id="phoneNumber" 
                                    value={formData.phoneNumber} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    id="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:border-transparent transition-all duration-200 pr-12"
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" fill="none" stroke="currentColor"><path d="M1 10C3 4.5 9 2 14 5c2 .8 6 4 6 5s-4 4.2-6 5C9 18 3 15.5 1 10z"/><circle cx="10" cy="10" r="3"/></svg>
                                    ) : (
                                        <svg width="20" height="20" fill="none" stroke="currentColor"><circle cx="10" cy="10" r="3"/><path d="M1 10C3 4.5 9 2 14 5c2 .8 6 4 6 5s-4 4.2-6 5C9 18 3 15.5 1 10z"/><line x1="4" y1="4" x2="16" y2="16"/></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-[#A55233] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#8e462b] focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-[#A55233] hover:text-[#8e462b] transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;