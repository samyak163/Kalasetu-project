import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { captureException } from '../lib/sentry.js';
import { Button, Card, Input, Alert } from '../components/ui';

const UserRegisterPage = () => {
    const [formData, setFormData] = useState({ 
        fullName: '', 
        email: '', 
        phoneNumber: '',
        password: '',
        useEmail: true,
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { userRegister } = useAuth();
    const { showToast } = useContext(ToastContext);
    const { refresh: refreshNotifications } = useNotifications();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const toggleAuthMethod = () => {
        setFormData((prev) => ({
            ...prev,
            useEmail: !prev.useEmail,
            // clear the other field when toggling
            email: prev.useEmail ? '' : prev.email,
            phoneNumber: prev.useEmail ? prev.phoneNumber : '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!formData.useEmail && !/^\+?[0-9\-\s]{6,20}$/.test(formData.phoneNumber.trim())) {
            setError('Please enter a valid phone number');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                fullName: formData.fullName.trim(),
                password: formData.password,
            };

            if (formData.useEmail) {
                payload.email = formData.email.trim();
            } else {
                payload.phoneNumber = formData.phoneNumber.trim();
            }

            await userRegister(payload);

            try {
                await refreshNotifications();
            } catch (err) {
                captureException(err, { context: 'post_registration_notification_refresh', component: 'UserRegisterPage' });
            }

            showToast('A verification link has been sent to your email. Please verify to continue.', 'info', 6000);
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || err.message || 'Registration failed');
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
                        Discover artisans and book them instantly
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
                                required={formData.useEmail}
                                placeholder="Enter your email address"
                            />
                        ) : (
                            <Input
                                label="Phone Number"
                                type="tel"
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required={!formData.useEmail}
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
                                    placeholder="Create a strong password (8+ characters)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
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
                            <Link to="/user/login" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UserRegisterPage;
