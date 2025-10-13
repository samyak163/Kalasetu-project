import React from 'react';

// THE FIX: Added .jsx extensions to all local imports
import HeroSearch from '../components/HeroSearch.jsx';
import Categories from '../components/Categories.jsx';
import FeaturedArtisans from '../components/FeaturedArtisans.jsx';
import HowItWorks from '../components/HowItWorks.jsx';

const HomePage = () => {
    return (
        <>
            <HeroSearch />
            <Categories />
            <FeaturedArtisans />
            <HowItWorks />
        </>
    );
};

export default HomePage;