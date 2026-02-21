import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { captureException } from '../lib/sentry.js';
import { Button, Card, Input, Alert } from '../components/ui';

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
    const { login } = useAuth(); // Get login function from context
    const { showToast } = useContext(ToastContext);
    const { refresh: refreshNotifications } = useNotifications();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const toggleAuthMethod = () => {
        setFormData({ ...formData, useEmail: !formData.useEmail });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        
        try {
            // Prepare registration data based on selected method
            const registrationData = {
                fullName: formData.fullName,
                password: formData.password,
                email: formData.useEmail ? formData.email : undefined,
                phoneNumber: formData.useEmail ? undefined : formData.phoneNumber
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`,
                registrationData,
                { withCredentials: true }
            );

            if (response.data.success) {
                // Update auth context
                login(response.data.artisan, 'artisan');
                try {
                    await refreshNotifications();
                } catch (err) {
                    captureException(err, { context: 'post_registration_notification_refresh', component: 'RegisterPage' });
                }

                showToast('A verification link has been sent to your email. Please verify to continue.', 'info', 6000);
                
                // Track with PostHog if available
                if (window.posthog) {
                    window.posthog.identify(response.data.artisan._id, {
                        email: response.data.artisan.email,
                        name: response.data.artisan.fullName,
                        user_type: 'artisan'
                    });
                    window.posthog.capture('artisan_registration_completed');
                }

                // Redirect to artisan dashboard quickly
                setTimeout(() => {
                    navigate(response.data.redirectTo || '/artisan/dashboard/account', { replace: true });
                }, 800);
            }
        } catch (err) {
            console.error('Registration error:', err);
            
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            
            // Track error with PostHog
            if (window.posthog) {
                window.posthog.capture('artisan_registration_failed', {
                    error: errorMessage
                });
            }

            // Log to LogRocket if available
            if (window.LogRocket) {
                window.LogRocket.captureException(err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link to="/" className="text-3xl font-bold text-brand-500">Kala<span className="text-gray-800">Setu</span></Link>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join our community of artisans
                    </p>
                </div>

                {/* Registration Form */}
                <Card className="py-8 px-6" padding={false} hover={false}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="error">{error}</Alert>
                        )}

                        {/* Full Name */}
                        <Input
                            label="Full Name"
                            type="text"
                            id="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                        />

                        {/* Authentication Method Toggle */}
                        <div className="flex items-center justify-center space-x-4">
                            <button
                                type="button"
                                onClick={toggleAuthMethod}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    formData.useEmail
                                        ? 'bg-brand-500 text-white'
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
                                        : 'bg-brand-500 text-white'
                                }`}
                            >
                                Phone
                            </button>
                        </div>

                        {/* Email or Phone Input */}
                        {formData.useEmail ? (
                            <Input
                                label="Email Address"
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email address"
                            />
                        ) : (
                            <Input
                                label="Phone Number"
                                type="tel"
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                placeholder="Enter your phone number"
                            />
                        )}

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
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
                                        <Eye className="w-5 h-5" />
                                    ) : (
                                        <EyeOff className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            disabled={loading}
                            loading={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/artisan/login" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>

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