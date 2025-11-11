import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/env.config.js';
import SEO from '../components/SEO.jsx';
import { optimizeImage } from '../utils/cloudinary.js';
import ReviewList from '../components/reviews/ReviewList.jsx';
import ArtisanMap from '../components/Maps/ArtisanMap.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { useContext } from 'react';
import api from '../lib/axios.js';

const ArtisanProfilePage = () => {
    const { publicId } = useParams();
    const navigate = useNavigate();
    const { user, userType } = useAuth();
    const { showToast } = useContext(ToastContext);

    const [artisan, setArtisan] = useState(null);
    const [services, setServices] = useState([]);
    const [seoData, setSeoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingTarget, setBookingTarget] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch artisan data
                const artisanRes = await axios.get(
                    `${API_CONFIG.BASE_URL}/api/artisans/${publicId}`
                );
                
                // Fetch services for this artisan
                const servicesRes = await axios.get(
                    `${API_CONFIG.BASE_URL}/api/services/artisan/${publicId}`
                );
                
                // Fetch SEO data
                try {
                    const seoRes = await axios.get(
                        `${API_CONFIG.BASE_URL}/api/seo/artisan/${publicId}`
                    );
                    if (seoRes.data.success) {
                        setSeoData(seoRes.data.seo);
                    }
                } catch (seoError) {
                    console.warn('SEO data not available:', seoError);
                }

                setArtisan(artisanRes.data);
                if (servicesRes.data.success) {
                    setServices(servicesRes.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching artisan:', error);
                setError(error.message || 'Artisan not found');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [publicId]);

    const handleChat = async () => {
        if (!user) {
            showToast('Please log in to chat with artisans', 'error');
            navigate('/login');
            return;
        }
        if (userType !== 'user') {
            showToast('Please log in as a customer to chat', 'error');
            return;
        }
        navigate(`/messages?artisan=${artisan._id}`);
    };

    const handleBook = (service = null) => {
        if (!user) {
            showToast('Please log in to book services', 'error');
            navigate('/login');
            return;
        }
        if (userType !== 'user') {
            showToast('Please log in as a customer to book services', 'error');
            return;
        }
        setBookingTarget({ artisan, service });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !artisan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">Error: {error || 'Artisan not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b]"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const mapCenter = artisan.location?.coordinates
        ? {
            lat: artisan.location.coordinates[1],
            lng: artisan.location.coordinates[0],
          }
        : null;

    return (
        <>
            {seoData && (
                <SEO
                    title={seoData.title}
                    description={seoData.description}
                    keywords={seoData.keywords}
                    image={seoData.image}
                    url={seoData.url}
                    type={seoData.type}
                    jsonLd={seoData.structuredData}
                />
            )}
            
            <div className="min-h-screen bg-gray-50">
                {/* Cover Image */}
                <div className="relative h-64 md:h-80 bg-gray-200">
                    <img 
                        src={optimizeImage(artisan.coverImageUrl || artisan.coverImage || 'https://placehold.co/1200x320/A55233/FFFFFF?text=KalaSetu', { width: 1200, height: 320, crop: 'fill' })} 
                        loading="lazy" 
                        alt={`${artisan.fullName}'s work`} 
                        className="w-full h-full object-cover" 
                    />
                </div>

                {/* Profile Header */}
                <div className="container mx-auto max-w-6xl -mt-24 relative px-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <img 
                                src={optimizeImage(artisan.profileImageUrl || artisan.profileImage || '/default-avatar.png', { width: 160, height: 160 })} 
                                loading="lazy" 
                                alt={artisan.fullName} 
                                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover -mt-16 md:-mt-24 shadow-lg"
                            />
                            <div className="flex-1 mt-4 md:mt-0">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">
                                            {artisan.fullName}
                                        </h1>
                                        <p className="text-lg text-[#A55233] font-semibold mb-2">
                                            {artisan.craft || artisan.businessName}
                                        </p>
                                        {artisan.tagline && (
                                            <p className="text-md text-gray-600 mb-2">{artisan.tagline}</p>
                                        )}
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                            {artisan.location?.city && artisan.location?.state && (
                                                <span className="flex items-center gap-1">
                                                    📍 {artisan.location.city}, {artisan.location.state}
                                                </span>
                                            )}
                                            {artisan.averageRating > 0 && (
                                                <span className="flex items-center gap-1">
                                                    ⭐ {Number(artisan.averageRating).toFixed(1)}
                                                </span>
                                            )}
                                            {artisan.isVerified && (
                                                <span className="text-green-600 flex items-center gap-1">
                                                    ✔ Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={handleChat}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            💬 Chat
                                        </button>
                                        {services.length > 0 && (
                                            <button
                                                onClick={() => handleBook()}
                                                className="px-6 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors font-medium"
                                            >
                                            📅 Book Service
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="container mx-auto max-w-6xl px-4 mt-6">
                    <div className="bg-white rounded-lg shadow-sm border-b border-gray-200">
                        <div className="flex overflow-x-auto">
                            {[
                                { key: 'overview', label: 'Overview' },
                                { key: 'services', label: `Services (${services.length})` },
                                { key: 'reviews', label: 'Reviews' },
                                { key: 'location', label: 'Location' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                        activeTab === tab.key
                                            ? 'border-[#A55233] text-[#A55233]'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="container mx-auto max-w-6xl px-4 mt-6 pb-16">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-xl p-6">
                                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">About Me</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {artisan.bio || 'No description available.'}
                                </p>
                                {(artisan.yearsOfExperience || artisan.teamSize || artisan.languagesSpoken?.length > 0) && (
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {artisan.yearsOfExperience && (
                                            <div>
                                                <p className="text-sm text-gray-500">Experience</p>
                                                <p className="text-lg font-semibold text-gray-900">{artisan.yearsOfExperience}</p>
                                            </div>
                                        )}
                                        {artisan.teamSize && (
                                            <div>
                                                <p className="text-sm text-gray-500">Team Size</p>
                                                <p className="text-lg font-semibold text-gray-900">{artisan.teamSize}</p>
                                            </div>
                                        )}
                                        {artisan.languagesSpoken?.length > 0 && (
                                            <div>
                                                <p className="text-sm text-gray-500">Languages</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {artisan.languagesSpoken.join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {artisan.portfolioImageUrls?.length > 0 && (
                                <div className="bg-white rounded-lg shadow-xl p-6">
                                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Portfolio</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {artisan.portfolioImageUrls.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={optimizeImage(img, { width: 400, height: 300, crop: 'fill' })}
                                                alt={`Portfolio ${idx + 1}`}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="bg-white rounded-lg shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Services Offered</h2>
                            {services.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No services available yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {services.map((service) => (
                                        <div
                                            key={service._id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            {service.images?.length > 0 && (
                                                <img
                                                    src={optimizeImage(service.images[0], { width: 400, height: 250, crop: 'fill' })}
                                                    alt={service.name}
                                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                                />
                                            )}
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                                            <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Price</p>
                                                    <p className="text-lg font-bold text-[#A55233]">
                                                        ₹{service.price || 'Contact for pricing'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Duration</p>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {service.durationMinutes || 60} min
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleBook(service)}
                                                className="w-full px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors font-medium"
                                            >
                                                Book This Service
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="bg-white rounded-lg shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Reviews</h2>
                            {artisan._id ? (
                                <ReviewList artisanId={artisan._id} />
                            ) : (
                                <p className="text-gray-500">Artisan ID not available.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'location' && (
                        <div className="bg-white rounded-lg shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Location</h2>
                            {artisan.location && (artisan.location.coordinates || artisan.location.city || artisan.location.address) ? (
                                <div className="space-y-4">
                                    <div className="text-gray-700">
                                        <p className="font-semibold mb-2">Address:</p>
                                        <p>
                                            {artisan.location.address || 
                                             `${artisan.location.city || ''}, ${artisan.location.state || ''}, ${artisan.location.country || ''}`.trim() || 'Location information available'}
                                        </p>
                                        {artisan.location.postalCode && (
                                            <p className="text-sm text-gray-500 mt-1">PIN: {artisan.location.postalCode}</p>
                                        )}
                                    </div>
                                    {artisan.location.coordinates && artisan.location.coordinates.length === 2 ? (
                                        <div className="h-96 rounded-lg overflow-hidden">
                                            <ArtisanMap artisans={[artisan]} />
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Map view not available for this location.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">Location information not available for this artisan.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {bookingTarget && (
                <BookServiceModal
                    target={bookingTarget}
                    onClose={() => setBookingTarget(null)}
                    userType={userType}
                    showToast={showToast}
                />
            )}
        </>
    );
};

const BookServiceModal = ({ target, onClose, userType, showToast }) => {
    const [startTime, setStartTime] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const service = target?.service;
    const artisan = target?.artisan;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startTime) {
            showToast?.('Please pick a time for your booking.', 'error');
            return;
        }
        if (userType !== 'user') {
            showToast?.('Please log in as a customer to book a service.', 'error');
            return;
        }
        setSubmitting(true);
        try {
            const start = new Date(startTime);
            const end = new Date(start.getTime() + (service?.durationMinutes || 60) * 60000);
            await api.post('/api/bookings', {
                artisan: artisan._id || artisan.id,
                serviceId: service?._id || service?.serviceId,
                start,
                end,
                notes,
                price: service?.price || 0,
            });
            showToast?.('Booking request sent to the artisan!', 'success');
            onClose();
        } catch (err) {
            console.error('Booking error:', err);
            const message = err.response?.data?.message || 'Failed to create booking. Please try again.';
            showToast?.(message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Book {service?.name || 'Service'}
                        </h3>
                        <p className="text-sm text-gray-500">With {artisan?.fullName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                        ×
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Preferred start time
                        </label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#A55233] focus:border-[#A55233]"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Notes for the artisan (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#A55233] focus:border-[#A55233]"
                            placeholder="Share any specifics, venue details, or questions."
                        />
                    </div>
                    <footer className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors disabled:opacity-60"
                            disabled={submitting}
                        >
                            {submitting ? 'Sending...' : 'Confirm Booking'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ArtisanProfilePage;
