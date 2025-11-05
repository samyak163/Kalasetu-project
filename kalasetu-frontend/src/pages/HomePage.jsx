import React from 'react';

// THE FIX: Added .jsx extensions to all local imports
import HeroSearch from '../components/HeroSearch.jsx';
import Categories from '../components/Categories.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import NearbyArtisans from '../components/Maps/NearbyArtisans.jsx';
import { isGoogleMapsEnabled } from '../lib/googleMaps.js';
import SEO from '../components/SEO.jsx';

const HomePage = () => {
    return (
        <>
            <SEO
                title="KalaSetu - Discover Local Artisans"
                description="Find and book local artisans for crafts and services near you."
                url="https://kalasetu.com/"
                type="website"
            />
            <HeroSearch />
            <Categories />
            {/* Featured Local Talent removed */}
            
            {/* Nearby Artisans Section (only if Google Maps is enabled) */}
            {isGoogleMapsEnabled() && (
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-8">Artisans Near You</h2>
                        <NearbyArtisans />
                    </div>
                </section>
            )}
            
            <HowItWorks />
        </>
    );
};

export default HomePage;