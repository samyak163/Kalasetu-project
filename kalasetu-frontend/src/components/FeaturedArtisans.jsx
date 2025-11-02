import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../config/env.config.js';

const FeaturedArtisans = () => {
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtisans = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/artisans`);
                if (!response.ok) throw new Error('Data could not be fetched!');
                const data = await response.json();
                setArtisans(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchArtisans();
    }, []);

    if (loading) { return <div className="text-center py-16">Loading artisans...</div>; }
    if (error) { return <div className="text-center py-16 text-red-500">Error: {error}</div>; }

    return (
        <section className="bg-white py-16 px-4 sm:px-8">
            <div className="container mx-auto max-w-7xl">
                <h3 className="text-3xl font-bold text-center text-[#1A1A1A] mb-2">Featured Local Talent</h3>
                <p className="text-center text-gray-600 mb-10">Meet some of the top-rated professionals on KalaSetu.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {artisans.map(artisan => (
                        // THE FINAL UPGRADE: The Link now points to the clean publicId URL
                        <Link to={`/${artisan.publicId}`} key={artisan.publicId} className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200 group cursor-pointer transition-transform duration-300 transform hover:-translate-y-2">
                            <div className="relative h-56">
                                <img src={artisan.coverImageUrl} alt={artisan.craft} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6 relative">
                               <div className="flex justify-center -mt-16">
                                   <img src={artisan.profileImageUrl} alt={artisan.fullName} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
                               </div>
                               <div className="pt-6 text-center">
                                 <h4 className="text-xl font-bold text-[#1A1A1A]">{artisan.fullName}</h4>
                                 <p className="text-gray-500 text-sm">{artisan.craft}</p>
                               </div>
                               <div className="mt-6 flex justify-between items-center text-sm border-t pt-4">
                                   <p className="text-gray-600">{artisan.location}</p>
                               </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedArtisans;