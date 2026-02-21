import React from 'react';
import { Link } from 'react-router-dom';
import { User, Palette } from 'lucide-react';
import { Card } from '../components/ui';

export default function AuthSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Log in to your account</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/user/login" className="group block">
            <Card hover={false} className="p-8 border border-gray-200 hover:shadow-lg hover:border-brand-200 transition">
              <User className="w-10 h-10 text-brand-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Login as User</h3>
              <p className="text-gray-600">Book services, manage orders and chat with artisans.</p>
            </Card>
          </Link>

          <Link to="/artisan/login" className="group block">
            <Card hover={false} className="p-8 border border-gray-200 hover:shadow-lg hover:border-brand-200 transition">
              <Palette className="w-10 h-10 text-brand-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Login as Artisan</h3>
              <p className="text-gray-600">Manage jobs, earnings and your professional profile.</p>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-8 text-sm text-gray-700">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-500 hover:text-brand-600 font-semibold hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
