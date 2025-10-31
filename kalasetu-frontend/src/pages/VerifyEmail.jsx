import React, { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

export default function VerifyEmail() {
  const [status, setStatus] = useState('Verifying email link...');

  useEffect(() => {
    const run = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          let emailToVerify = window.localStorage.getItem('emailForSignIn');
          if (!emailToVerify) {
            emailToVerify = window.prompt('Please provide your email');
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
            setStatus('Login successful! Redirecting...');
            setTimeout(() => (window.location.href = '/dashboard'), 800);
          } else {
            setStatus('Login failed. Please try again.');
          }
        } else {
          setStatus('Invalid email link.');
        }
      } catch (e) {
        console.error(e);
        setStatus('Verification failed.');
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700">{status}</p>
    </div>
  );
}