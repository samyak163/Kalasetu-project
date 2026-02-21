import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Card, Input, Alert } from '../components/ui';

const LoginPage = () => {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Use artisanLogin for artisan portal authentication
    const { artisanLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await artisanLogin({ loginIdentifier, password });
            // After successful login, take artisans to their account page
            navigate('/artisan/dashboard/account');
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
                    <Link to="/" className="text-3xl font-bold text-brand-500">Kala<span className="text-gray-800">Setu</span></Link>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your artisan account
                    </p>
                </div>

                {/* Login Form */}
                <Card className="py-8 px-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="loginIdentifier" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email or Phone Number
                            </label>
                            <Input
                                id="loginIdentifier"
                                type="text"
                                value={loginIdentifier}
                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                required
                                placeholder="Enter your email or phone number"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pr-12"
                                    placeholder="Enter your password"
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
                        <div className="flex justify-end mb-2">
                            <Link to="/forgot-password" className="text-xs text-brand-500 hover:underline">Forgot Password?</Link>
                        </div>

                        {error && (
                            <Alert variant="error">{error}</Alert>
                        )}

                        <Button variant="primary" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                                Create new account
                            </Link>
                        </p>
                    </div>
                </Card>

                {/* Additional Info */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
