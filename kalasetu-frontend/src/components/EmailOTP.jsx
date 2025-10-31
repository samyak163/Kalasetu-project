import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

export default function EmailOTP() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const actionCodeSettings = {
    url: window.location.origin + '/verify-email',
    handleCodeInApp: true,
  };

  const sendEmailLink = async () => {
    try {
      setError('');
      setLoading(true);
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      alert('Verification email sent! Check your inbox.');
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to send email link');
    } finally {
      setLoading(false);
    }
  };

  // Optional: helper if you want to verify on this component too
  const verifyOnThisPage = async () => {
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
          window.location.href = '/dashboard';
        }
      } else {
        alert('Visit the link from your email in the same browser.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Verification failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button onClick={sendEmailLink} disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">
        {loading ? 'Sending...' : 'Send Verification Link'}
      </button>

      {/* Debug helper for verifying on same page */}
      {/* <button onClick={verifyOnThisPage} className="mt-3 w-full bg-gray-600 text-white p-2 rounded">Verify Link</button> */}
    </div>
  );
}