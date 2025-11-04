import React from 'react';
import { Link } from 'react-router-dom';

export default function RegisterSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">Choose how you want to use KalaSetu</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/customer/register" className="group block rounded-xl border border-gray-200 bg-white hover:shadow-lg transition p-8">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign up as Customer</h3>
            <p className="text-gray-600">Find artisans, book services and track orders.</p>
          </Link>

          <Link to="/artisan/register" className="group block rounded-xl border border-gray-200 bg-white hover:shadow-lg transition p-8">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign up as Artisan</h3>
            <p className="text-gray-600">Get leads, manage jobs and grow your business.</p>
          </Link>
        </div>

        <div className="text-center mt-8 text-sm text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="text-[#A55233] font-semibold hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
}


