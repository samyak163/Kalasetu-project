import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Log in to your account</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/user/login" className="group block rounded-xl border border-gray-200 bg-white hover:shadow-lg transition p-8">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login as USER</h3>
            <p className="text-gray-600">Book services, manage orders and chat with artisans.</p>
          </Link>

          <Link to="/artisan/login" className="group block rounded-xl border border-gray-200 bg-white hover:shadow-lg transition p-8">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login as Artisan</h3>
            <p className="text-gray-600">Manage jobs, earnings and your professional profile.</p>
          </Link>
        </div>

        <div className="text-center mt-8 text-sm text-gray-700">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#A55233] font-semibold hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}


