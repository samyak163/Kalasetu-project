import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/env.config.js';
import SEO from '../components/SEO.jsx';
import { optimizeImage } from '../utils/cloudinary.js';
import ReviewList from '../components/reviews/ReviewList.jsx';

const ArtisanProfilePage = () => {
    // THE UPGRADE: We are now getting the 'publicId' from the URL instead of 'id'.
    const { publicId } = useParams(); 

    const [artisan, setArtisan] = useState(null);
    const [seoData, setSeoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch artisan data
                const artisanRes = await axios.get(
                    `${API_CONFIG.BASE_URL}/api/artisans/${publicId}`
                );
                
                // Fetch SEO data
                const seoRes = await axios.get(
                    `${API_CONFIG.BASE_URL}/api/seo/artisan/${publicId}`
                );

                setArtisan(artisanRes.data);
                if (seoRes.data.success) {
                    setSeoData(seoRes.data.seo);
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

    if (loading) { return <div className="text-center py-40">Loading profile...</div>; }
    if (error) { return <div className="text-center py-40 text-red-500">Error: {error}</div>; }
    if (!artisan) { return <div className="text-center py-40">Artisan not found.</div>; }

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
            
            <div>
            {/* ... (The beautiful UI for the profile page is the same as before) ... */}
            <div className="relative h-64 md:h-80 bg-gray-200">
                <img src={optimizeImage(artisan.coverImageUrl, { width: 1200, height: 320, crop: 'fill' })} loading="lazy" alt={`${artisan.fullName}'s work`} className="w-full h-full object-cover" />
            </div>
            <div className="container mx-auto max-w-5xl -mt-24 relative px-4">
                <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col md:flex-row items-center">
                    <img src={optimizeImage(artisan.profileImageUrl, { width: 160, height: 160 })} loading="lazy" alt={artisan.fullName} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover -mt-16 md:-mt-24"/>
                    <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">{artisan.fullName}</h1>
                        <p className="text-lg text-[#A55233] font-semibold">{artisan.craft}</p>
                        <p className="text-md text-gray-600 mt-1">
                            📍 {artisan.location?.city && artisan.location?.state 
                                ? `${artisan.location.city}, ${artisan.location.state}` 
                                : artisan.location?.address || 'Location not specified'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="container mx-auto max-w-5xl mt-8 px-4 pb-16">
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">About Me</h2>
                    <p className="text-gray-700 leading-relaxed">{artisan.bio}</p>
                </div>
                <div className="bg-white rounded-lg shadow-xl p-6 mt-6">
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Reviews</h2>
                    <ReviewList artisanId={artisan._id} />
                </div>
            </div>
            </div>
        </>
    );
};

export default ArtisanProfilePage;