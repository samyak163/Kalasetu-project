import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'invalid'
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const run = async () => {
      try {
        // Check if this is a Firebase email link sign-in
        if (isSignInWithEmailLink(auth, window.location.href)) {
          let emailToVerify = window.localStorage.getItem('emailForSignIn');
          if (!emailToVerify) {
            emailToVerify = window.prompt('Please provide your email for confirmation');
          }
          if (!emailToVerify) {
            setStatus('error');
            setMessage('Email address is required to complete verification.');
            return;
          }
          const result = await signInWithEmailLink(auth, emailToVerify, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          const idToken = await result.user.getIdToken();
          const response = await fetch('/api/auth/firebase-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ idToken }),
          });
          if (response.ok) {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting to dashboard...');
            setTimeout(() => (window.location.href = '/dashboard'), 1500);
          } else {
            const data = await response.json().catch(() => ({}));
            setStatus('error');
            setMessage(data.message || 'Verification failed. Please try again.');
          }
        } else {
          // Check for a token-based verification via URL params
          const token = searchParams.get('token');
          if (token) {
            const response = await fetch(`/api/auth/verify-email?token=${token}`, {
              method: 'GET',
              credentials: 'include',
            });
            if (response.ok) {
              setStatus('success');
              setMessage('Your email has been verified successfully!');
            } else {
              const data = await response.json().catch(() => ({}));
              setStatus('error');
              setMessage(data.message || 'Verification failed. The link may have expired.');
            }
          } else {
            setStatus('invalid');
            setMessage('Invalid verification link. No token or email link found.');
          }
        }
      } catch (e) {
        setStatus('error');
        setMessage(e.message || 'Verification failed. Please try again.');
      }
    };
    run();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-brand-500">
            Kala<span className="text-gray-800">Setu</span>
          </Link>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-green-700 font-semibold">{message}</p>
              <Link
                to="/user/login"
                className="mt-2 text-sm text-brand-500 hover:text-brand-600 font-semibold hover:underline"
              >
                Go to Login
              </Link>
            </div>
          )}

          {(status === 'error' || status === 'invalid') && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-red-700 font-semibold">{message}</p>
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  to="/user/login"
                  className="text-sm text-brand-500 hover:text-brand-600 font-semibold hover:underline"
                >
                  Go to Login
                </Link>
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
