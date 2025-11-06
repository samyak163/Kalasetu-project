# Comprehensive Implementation Guide: reCAPTCHA, OTP, Search Enhancement

## ✅ Completed Backend Components

### 1. OTP System
- ✅ `kalasetu-backend/utils/otp.js` - OTP generation and verification
- ✅ `kalasetu-backend/utils/email.js` - Added `sendOTPEmail()` function
- ✅ OTP codes are 6-digit, expire in 10 minutes

### 2. reCAPTCHA System
- ✅ `kalasetu-backend/utils/recaptcha.js` - reCAPTCHA verification
- ✅ `kalasetu-backend/config/env.config.js` - Added RECAPTCHA_CONFIG
- ✅ `kalasetu-backend/routes/authHelpersRoutes.js` - Verification endpoint
- ✅ Mounted at `/api/auth-helpers/verify-recaptcha`

## 🔧 Frontend Implementation Required

### Step 1: Install reCAPTCHA Package
```bash
cd kalasetu-frontend
npm install react-google-recaptcha-v3
```

### Step 2: Add reCAPTCHA to Registration Pages

**Update `RegisterPage.jsx` and `UserRegisterPage.jsx`:**

1. Import reCAPTCHA:
```javascript
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
```

2. Add reCAPTCHA hook:
```javascript
const { executeRecaptcha } = useGoogleReCaptcha();
```

3. Verify before submit:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Verify reCAPTCHA
  let recaptchaToken = null;
  if (executeRecaptcha) {
    recaptchaToken = await executeRecaptcha('register');
    
    // Verify with backend
    const verifyRes = await axios.post('/api/auth-helpers/verify-recaptcha', {
      token: recaptchaToken
    });
    
    if (!verifyRes.data.success) {
      setError('reCAPTCHA verification failed. Please try again.');
      return;
    }
  }
  
  // Continue with registration...
};
```

4. Add script to `index.html`:
```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

### Step 3: Add OTP Verification Flow

**Create `OTPVerification.jsx` component:**
```javascript
import React, { useState } from 'react';

const OTPVerification = ({ email, name, onVerify, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await onVerify(otpCode);
    } catch (err) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
      <p className="text-gray-600 mb-6">
        We've sent a 6-digit code to <strong>{email}</strong>
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-center mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#A55233] focus:ring-2"
            />
          ))}
        </div>
        
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        
        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-[#A55233] text-white py-3 rounded-lg hover:bg-[#8e462b] disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>
      
      <button
        onClick={onResend}
        className="mt-4 text-[#A55233] hover:underline"
      >
        Resend Code
      </button>
    </div>
  );
};

export default OTPVerification;
```

**Update Registration Flow:**
1. After successful registration, don't auto-login
2. Send OTP to email
3. Show OTP verification component
4. On successful verification, complete registration

### Step 4: Update Search Results Page

**Update `SearchResults.jsx`:**

```javascript
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/env.config.js';
import SEO from '../components/SEO.jsx';
import SearchBar from '../components/SearchBar.jsx';
import LocationSearch from '../components/LocationSearch.jsx';
import { optimizeImage } from '../utils/cloudinary.js';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  
  const [results, setResults] = useState({ artisans: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query && !category && !city) {
        setResults({ artisans: [], categories: [] });
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (category) params.set('category', category);
        if (city) params.set('city', city);
        if (selectedLocation) {
          params.set('lat', selectedLocation.lat);
          params.set('lng', selectedLocation.lng);
        }

        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/api/search?${params.toString()}`
        );

        if (response.data?.success) {
          setResults({
            artisans: response.data.artisans || [],
            categories: response.data.categories || [],
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults({ artisans: [], categories: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, city, selectedLocation]);

  const handleSearch = (searchQuery) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    const params = new URLSearchParams(searchParams);
    if (location.city) params.set('city', location.city);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${query ? `Search: ${query} | ` : ''}Artisans | KalaSetu`}
        description="Find skilled artisans near you"
      />
      
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar 
                initialQuery={query}
                onSearch={handleSearch}
              />
            </div>
            <div className="w-full md:w-80">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {(query || category || city) && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {query && `Search Results for "${query}"`}
              {category && `Category: ${category}`}
              {city && ` in ${city}`}
            </h1>
            {results.artisans.length > 0 && (
              <p className="text-gray-600 mt-2">
                Found {results.artisans.length} artisan{results.artisans.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#A55233]"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        )}

        {!loading && results.artisans.length === 0 && (query || category || city) && (
          <div className="text-center py-12">
            <p className="text-gray-600">No artisans found. Try different search terms.</p>
          </div>
        )}

        {!loading && results.artisans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.artisans.map((artisan) => {
              const artisanId = artisan.publicId || artisan.id || artisan._id;
              return (
                <div
                  key={artisanId}
                  onClick={() => navigate(`/artisan/${artisanId}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="h-48 bg-gray-200">
                    {artisan.profileImage && (
                      <img
                        src={optimizeImage(artisan.profileImage, { width: 400, height: 300 })}
                        alt={artisan.fullName}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {artisan.fullName || artisan.businessName}
                    </h3>
                    <p className="text-sm text-[#A55233] mt-1">
                      {artisan.category || artisan.craft}
                    </p>
                    {artisan.city && (
                      <p className="text-sm text-gray-600 mt-1">📍 {artisan.city}</p>
                    )}
                    {artisan.rating && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{artisan.rating}</span>
                        {artisan.reviewCount && (
                          <span className="text-sm text-gray-500">
                            ({artisan.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Categories */}
        {results.categories.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {results.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set('category', cat);
                    setSearchParams(params);
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-[#A55233] hover:text-white transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
```

### Step 5: Update SearchBar Component

**Update `SearchBar.jsx` to navigate to search page:**

```javascript
// In handleSearch function:
const handleSearch = (e) => {
  e.preventDefault();
  if (query.trim()) {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowDropdown(false);
  }
};

// In handleArtisanClick:
const handleArtisanClick = (artisan) => {
  const artisanId = artisan.publicId || artisan.id || artisan._id;
  navigate(`/artisan/${artisanId}`);
  setShowDropdown(false);
  setQuery('');
};

// In handleCategoryClick:
const handleCategoryClick = (category) => {
  navigate(`/search?category=${encodeURIComponent(category)}`);
  setShowDropdown(false);
  setQuery('');
};
```

## 🔧 Backend Updates Needed

### Add OTP Endpoints to Auth Controllers

**Update `authController.js` and `userAuthController.js`:**

1. Add OTP sending before registration
2. Add OTP verification step
3. Store OTP in temporary session or database

**Example flow:**
```javascript
// Step 1: Send OTP
router.post('/send-otp', async (req, res) => {
  const { email, phoneNumber, purpose } = req.body;
  const { code, expiresAt } = generateOTPWithExpiry(10);
  
  // Store OTP (use Redis or database)
  // await storeOTP(email, code, expiresAt);
  
  // Send OTP
  await sendOTPEmail(email, name, code, purpose);
  
  res.json({ success: true, message: 'OTP sent' });
});

// Step 2: Verify OTP and Register
router.post('/register', async (req, res) => {
  const { email, otp, ...userData } = req.body;
  
  // Verify OTP
  const isValid = await verifyOTP(email, otp);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  
  // Continue with registration...
});
```

## 📝 Environment Variables Needed

Add to `.env`:
```env
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
RECAPTCHA_VERSION=v3
RECAPTCHA_MIN_SCORE=0.5
```

## ✅ Testing Checklist

- [ ] reCAPTCHA works on registration pages
- [ ] OTP sent to email during registration
- [ ] OTP verification works
- [ ] Search results page shows with header search
- [ ] Location search works on results page
- [ ] Clicking search suggestions opens full page
- [ ] Navigation flow is smooth

## 🚀 Deployment Notes

1. Get reCAPTCHA keys from Google reCAPTCHA Console
2. Add environment variables
3. Install frontend packages: `npm install react-google-recaptcha-v3`
4. Test OTP email delivery
5. Test search flow end-to-end

