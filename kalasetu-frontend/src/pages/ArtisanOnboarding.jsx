import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import api from '../lib/axios.js';

const BRAND = '#A55233';

const CATEGORIES = [
  'Pottery', 'Weaving', 'Jewelry Making', 'Woodwork', 'Painting',
  'Block Printing', 'Textile Design', 'Metalwork', 'Stone Carving',
  'Embroidery', 'Leather Craft', 'Glass Art',
];

const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

const STEPS = [
  { num: 1, label: 'Profile' },
  { num: 2, label: 'Craft' },
  { num: 3, label: 'Availability' },
  { num: 4, label: 'Portfolio' },
  { num: 5, label: 'Review' },
];

const DEFAULT_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const ArtisanOnboarding = () => {
  const { user } = useAuth();
  const { showToast } = useContext(ToastContext);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);

  // Step 1: Profile Basics
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Step 2: Your Craft
  const [categoryName, setCategoryName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('60');

  // Step 3: Availability
  const [selectedDays, setSelectedDays] = useState(DEFAULT_DAYS);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  // Step 4: Portfolio
  const [portfolioUrls, setPortfolioUrls] = useState('');

  const toggleDay = (dayKey) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const portfolioImages = portfolioUrls
    .split(',')
    .map((u) => u.trim())
    .filter((u) => u.length > 0);

  // --- Step handlers ---

  const handleStep1 = async () => {
    if (!fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return false;
    }
    setSaving(true);
    try {
      await api.patch('/api/artisan/profile', {
        fullName: fullName.trim(),
        bio: bio.trim(),
        profileImageUrl: profileImageUrl.trim() || undefined,
        location: { city: city.trim(), state: state.trim() },
      });
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save profile', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleStep2 = async () => {
    if (!categoryName) {
      showToast('Please select a craft category', 'error');
      return false;
    }
    if (!serviceName.trim()) {
      showToast('Please enter a service name', 'error');
      return false;
    }
    if (!servicePrice || Number(servicePrice) <= 0) {
      showToast('Please enter a valid price', 'error');
      return false;
    }
    setSaving(true);
    try {
      await api.post('/api/artisan/services', {
        name: serviceName.trim(),
        description: serviceDescription.trim(),
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration) || 60,
        categoryName,
      });
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save service', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleStep3 = async () => {
    if (selectedDays.length === 0) {
      showToast('Please select at least one working day', 'error');
      return false;
    }
    setSaving(true);
    try {
      const recurringSchedule = selectedDays.map((day) => ({
        dayOfWeek: day,
        slots: [{ startTime, endTime }],
      }));
      await api.post('/api/availability', { recurringSchedule });
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save availability', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await api.patch('/api/artisan/profile', { isActive: true });
      setPublished(true);
      showToast('Your profile is now live!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    let ok = true;
    if (step === 1) ok = await handleStep1();
    else if (step === 2) ok = await handleStep2();
    else if (step === 3) ok = await handleStep3();
    // Step 4 (portfolio) has no API call — just advance

    if (ok && step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // --- Published success screen ---

  if (published) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
          <div className="text-6xl">&#10024;&#127881;&#10024;</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your Profile is Live!
          </h1>
          <p className="text-gray-600">
            Congratulations! Customers can now discover your craft on KalaSetu.
            Start building your reputation by delivering great service.
          </p>
          <Link
            to="/artisan/dashboard"
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold transition-colors"
            style={{ backgroundColor: BRAND }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // --- Wizard UI ---

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Set Up Your Artisan Profile</h1>
          <p className="text-gray-500 mt-1">Complete these steps to go live on KalaSetu</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const isActive = s.num === step;
            const isDone = s.num < step;
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-white'
                        : isDone
                        ? 'text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: BRAND }
                        : isDone
                        ? { backgroundColor: BRAND, opacity: 0.7 }
                        : undefined
                    }
                  >
                    {isDone ? '\u2713' : s.num}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      isActive ? 'font-semibold' : 'text-gray-400'
                    }`}
                    style={isActive ? { color: BRAND } : undefined}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-2"
                    style={{
                      backgroundColor: s.num < step ? BRAND : '#e5e7eb',
                      opacity: s.num < step ? 0.7 : 1,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Card */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
          {/* Step 1: Profile Basics */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Basics</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tell customers who you are and where you are based.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': BRAND }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    rows={3}
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your craft, your journey, what makes your work special..."
                  />
                  <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Profile Image URL</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Jaipur"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Rajasthan"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Your Craft */}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Craft</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose your craft category and add your first service offering.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Craft Category *</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <hr className="border-gray-100" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  First Service
                </h3>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Service Name *</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g. Custom Pottery Piece"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    rows={2}
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    placeholder="What does this service include?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Price (INR) *</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Duration (mins)</label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                      value={serviceDuration}
                      onChange={(e) => setServiceDuration(e.target.value)}
                      placeholder="60"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Set your working days and hours so customers know when to book.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((d) => {
                      const active = selectedDays.includes(d.key);
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => toggleDay(d.key)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            active ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-300'
                          }`}
                          style={active ? { backgroundColor: BRAND } : undefined}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Portfolio */}
          {step === 4 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Portfolio</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showcase your work. Paste image URLs separated by commas.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Image URLs</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    rows={3}
                    value={portfolioUrls}
                    onChange={(e) => setPortfolioUrls(e.target.value)}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>
                {portfolioImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview ({portfolioImages.length} image{portfolioImages.length !== 1 ? 's' : ''})
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {portfolioImages.map((url, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg border overflow-hidden bg-gray-100"
                        >
                          <img
                            src={url}
                            alt={`Portfolio ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                              const span = document.createElement('span');
                              span.textContent = 'Invalid URL';
                              span.className = 'text-xs text-gray-400';
                              e.target.parentElement.appendChild(span);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 5: Review & Go Live */}
          {step === 5 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Review & Go Live</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Check your details below, then publish your profile.
                </p>
              </div>
              <div className="space-y-4">
                {/* Profile Summary */}
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND }}>
                    Profile
                  </h3>
                  <p className="text-gray-800 font-medium">{fullName || '(not set)'}</p>
                  {bio && <p className="text-sm text-gray-600">{bio}</p>}
                  {(city || state) && (
                    <p className="text-sm text-gray-500">
                      {[city, state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                {/* Craft Summary */}
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND }}>
                    Craft & Service
                  </h3>
                  <p className="text-gray-800">
                    <span className="font-medium">Category:</span> {categoryName || '(not set)'}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">Service:</span> {serviceName || '(not set)'}
                  </p>
                  {serviceDescription && (
                    <p className="text-sm text-gray-600">{serviceDescription}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    &#8377;{servicePrice || 0} &middot; {serviceDuration || 60} mins
                  </p>
                </div>

                {/* Availability Summary */}
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND }}>
                    Availability
                  </h3>
                  <p className="text-gray-800">
                    {selectedDays.length > 0
                      ? DAYS.filter((d) => selectedDays.includes(d.key))
                          .map((d) => d.label)
                          .join(', ')
                      : '(no days selected)'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {startTime} &ndash; {endTime}
                  </p>
                </div>

                {/* Portfolio Summary */}
                {portfolioImages.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND }}>
                      Portfolio
                    </h3>
                    <div className="flex gap-2 overflow-x-auto">
                      {portfolioImages.slice(0, 4).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Portfolio ${i + 1}`}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      ))}
                      {portfolioImages.length > 4 && (
                        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                          +{portfolioImages.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: BRAND }}
              >
                {saving ? 'Saving...' : 'Next'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: BRAND }}
              >
                {saving ? 'Publishing...' : 'Publish My Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanOnboarding;
