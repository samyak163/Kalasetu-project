# 🔐 reCAPTCHA v2 Frontend Integration Guide

## Installation

```bash
cd kalasetu-frontend
npm install react-google-recaptcha
```

---

## Option 1: Artisan Registration Component

### File: `kalasetu-frontend/src/pages/auth/ArtisanRegister.jsx`

```jsx
import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';

const ArtisanRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await recaptchaRef.current?.executeAsync();
      
      // Reset reCAPTCHA for next attempt
      recaptchaRef.current?.reset();

      // Send registration request
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          ...formData,
          recaptchaToken
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Redirect to dashboard
        window.location.href = '/artisan/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Artisan Registration</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            required
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>

        {/* reCAPTCHA v2 Checkbox */}
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            size="normal"
            theme="light"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default ArtisanRegister;
```

---

## Option 2: User/Customer Registration Component

### File: `kalasetu-frontend/src/pages/auth/UserRegister.jsx`

```jsx
import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';

const UserRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await recaptchaRef.current?.executeAsync();
      
      // Reset reCAPTCHA for next attempt
      recaptchaRef.current?.reset();

      // Send registration request
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        {
          ...formData,
          recaptchaToken
        },
        { withCredentials: true }
      );

      if (response.data) {
        // Redirect to home or profile
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Account</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            required
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>

        {/* reCAPTCHA v2 Checkbox */}
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            size="normal"
            theme="light"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default UserRegister;
```

---

## Option 3: Invisible reCAPTCHA (v2 Invisible Badge)

If you want NO checkbox but still want v2 security:

```jsx
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
  size="invisible"  // 👈 Makes it invisible!
/>

// Then call it programmatically:
const handleSubmit = async (e) => {
  e.preventDefault();
  const token = await recaptchaRef.current.executeAsync();
  // Continue with registration...
};
```

This shows a badge in the corner and only shows challenge if user is suspicious.

---

## reCAPTCHA Configuration Options

```jsx
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
  
  // Size options:
  size="normal"      // Standard checkbox (recommended)
  // size="compact"  // Smaller checkbox
  // size="invisible" // No checkbox, badge only
  
  // Theme:
  theme="light"      // Light theme (default)
  // theme="dark"    // Dark theme
  
  // Callbacks:
  onChange={(token) => console.log('User verified', token)}
  onExpired={() => console.log('Token expired')}
  onErrored={() => console.log('reCAPTCHA error')}
/>
```

---

## Environment Variables

### Backend (Render):
```bash
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

### Frontend (Vercel):
```bash
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

*(These are Google's test keys for development - replace with your real keys in production)*

---

## Testing with Test Keys

Google provides test keys that always pass:

**Test Site Key:**
```
6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Test Secret Key:**
```
6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

Use these for local development and testing!

---

## Key Points

✅ **v2 Normal** - Shows checkbox, user clicks, sometimes gets challenge
✅ **v2 Invisible** - No checkbox, badge only, shows challenge if suspicious
✅ **No time limit** - User can take as long as they need
✅ **Backend already supports it** - Your code is ready!
✅ **Non-blocking** - Runs in background, doesn't slow registration

---

## What You Need to Do

1. ✅ Install: `npm install react-google-recaptcha`
2. ✅ Get real keys from: https://www.google.com/recaptcha/admin/create
3. ✅ Choose **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
4. ✅ Add to your registration components (code above)
5. ✅ Add env variables to Render + Vercel
6. ✅ Test!
